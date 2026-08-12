// FRASS-0488 — Identity & Devices panel.
//
// Lives inside the Frass Card (your identity page) rather than a new
// dashboard: one identity, one place. It shows the passkeys/biometrics you
// have set up, the devices that have opened your account, and the recent
// identity checks Frass performed on your behalf.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { startRegistration, browserSupportsWebAuthn } from "@simplewebauthn/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  finishPasskeyRegistration,
  getMyIdentityCenter,
  removePasskey,
  revokeDevice,
  startPasskeyRegistration,
} from "@/lib/security/identity.functions";
import { deviceLabelGuess, sensitiveAction } from "@/lib/security/sensitive-actions";

const panel =
  "rounded-2xl border border-border/60 bg-background/70 p-6 backdrop-blur";

function when(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function IdentityCenter() {
  const qc = useQueryClient();
  const load = useServerFn(getMyIdentityCenter);
  const begin = useServerFn(startPasskeyRegistration);
  const finish = useServerFn(finishPasskeyRegistration);
  const drop = useServerFn(removePasskey);
  const revoke = useServerFn(revokeDevice);

  const [supported, setSupported] = useState(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    setSupported(browserSupportsWebAuthn());
    setLabel(deviceLabelGuess());
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["identity-center"],
    queryFn: () => load(),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["identity-center"] });

  const enroll = useMutation({
    mutationFn: async () => {
      const options = await begin();
      const response = await startRegistration({ optionsJSON: options as never });
      return finish({
        data: {
          response,
          label: label.trim() || deviceLabelGuess(),
          deviceKind: deviceLabelGuess(),
        },
      });
    },
    onSuccess: () => {
      toast.success("This device can now confirm it's you.");
      refresh();
    },
    onError: () => toast.error("That didn't complete. You can always use your password."),
  });

  const passkeys = data?.passkeys ?? [];
  const devices = data?.devices ?? [];
  const checks = data?.checks ?? [];
  const signals = data?.signals;

  return (
    <section className={panel} id="identity">
      <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
        Identity & Devices
      </div>
      <h2 className="mt-2 font-display text-2xl">How Frass knows it's you</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Money, payouts and Founder controls ask you to confirm your identity first. Your face or
        fingerprint never leaves your device — Frass only keeps the key your device hands over.
      </p>

      {signals?.newDeviceLabel ? (
        <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          New device seen: <strong>{signals.newDeviceLabel}</strong> ({when(signals.newDeviceAt)}).
          If that wasn't you, remove it below and change your password.
        </div>
      ) : null}
      {signals && signals.recentFailures > 0 ? (
        <div className="mt-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          {signals.recentFailures} identity check{signals.recentFailures === 1 ? "" : "s"} failed in
          the last 24 hours.
        </div>
      ) : null}

      <div className="mt-6 rounded-xl border border-border/60 p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.2em]">
          Face ID · Touch ID · Windows Hello · Security keys
        </div>
        {supported ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Name this device"
              className="max-w-xs"
            />
            <Button onClick={() => enroll.mutate()} disabled={enroll.isPending}>
              {enroll.isPending ? "Waiting for your device…" : "Set up on this device"}
            </Button>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            This browser doesn't offer biometrics. Your password still protects every sensitive
            action.
          </p>
        )}

        <ul className="mt-5 space-y-2">
          {isLoading ? (
            <li className="text-sm text-muted-foreground">Loading…</li>
          ) : passkeys.length === 0 ? (
            <li className="text-sm text-muted-foreground">
              No devices enrolled yet. Password is used for every check.
            </li>
          ) : (
            passkeys.map((k) => (
              <li
                key={k.id}
                className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3 text-sm"
              >
                <span>
                  <strong>{k.device_label}</strong>
                  <span className="ml-2 text-muted-foreground">
                    {k.device_kind} · last used {when(k.last_used_at)}
                  </span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await drop({ data: { id: k.id } });
                    toast.success("Removed.");
                    refresh();
                  }}
                >
                  Remove
                </Button>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="mt-6 rounded-xl border border-border/60 p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.2em]">Devices on your account</div>
        <ul className="mt-4 space-y-2">
          {devices.length === 0 ? (
            <li className="text-sm text-muted-foreground">Only this session so far.</li>
          ) : (
            devices.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-3 text-sm"
              >
                <span>
                  <strong>{d.label}</strong>
                  <span className="ml-2 text-muted-foreground">
                    {d.approx_location ?? "location unknown"} · last seen {when(d.last_seen_at)}
                    {d.trusted ? "" : " · removed"}
                  </span>
                </span>
                {d.trusted ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await revoke({ data: { id: d.id } });
                      toast.success("Device removed.");
                      refresh();
                    }}
                  >
                    Remove
                  </Button>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="mt-6 rounded-xl border border-border/60 p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.2em]">Recent identity checks</div>
        <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
          {checks.length === 0 ? (
            <li>No sensitive actions confirmed yet.</li>
          ) : (
            checks.map((c, i) => (
              <li key={`${c.created_at}-${i}`}>
                {when(c.created_at)} — {sensitiveAction(c.action)?.label ?? c.action} via {c.method}
                {c.succeeded ? "" : " · failed"}
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
