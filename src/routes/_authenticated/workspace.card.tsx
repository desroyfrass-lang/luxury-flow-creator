import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PageFeedback } from "@/components/page-feedback";
import { getMyProfile } from "@/lib/profiles.functions";
import { getMyCard, getMyCardAnalytics, updateMyCard } from "@/lib/card.functions";
import type { BusinessCard } from "@/lib/card.functions";
import {
  CARD_ACCENTS,
  CARD_EVENT_LABELS,
  CARD_EVENT_ORDER,
  CARD_PRINCIPLE,
  CARD_SECTIONS,
  CARD_THEMES,
  cardPath,
} from "@/lib/card";
import { ShareCardButton } from "@/components/card/card-share";
import { QuickSellPanel } from "@/components/card/quick-sell";
import { CARD_COMMERCE_PRINCIPLE, PAYOUT_PROVIDERS } from "@/lib/card-commerce";

export const Route = createFileRoute("/_authenticated/workspace/card")({
  head: () => ({
    meta: [
      { title: "Frass Card — Identity & Point of Sale" },
      {
        name: "description",
        content:
          "Customise and share your Frass Living Business Card: hero media, theme, links, QR code and performance analytics.",
      },
      { property: "og:title", content: "Frass Card — Identity & Point of Sale" },
      {
        property: "og:description",
        content: "Your always-current digital handshake, ready to share anywhere.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CardStudio,
});

const panel = "rounded-2xl border border-border/60 bg-background/60 p-6 backdrop-blur";
const heading = "text-xs uppercase tracking-[0.25em] text-muted-foreground";

function CardStudio() {
  const queryClient = useQueryClient();
  const profileFn = useServerFn(getMyProfile);
  const cardFn = useServerFn(getMyCard);
  const saveFn = useServerFn(updateMyCard);
  const analyticsFn = useServerFn(getMyCardAnalytics);

  const { data: profile } = useQuery({ queryKey: ["my-profile"], queryFn: () => profileFn() });
  const { data: card } = useQuery({ queryKey: ["my-business-card"], queryFn: () => cardFn() });
  const { data: analytics } = useQuery({ queryKey: ["my-card-analytics"], queryFn: () => analyticsFn() });

  const [form, setForm] = useState<Partial<BusinessCard>>({});
  useEffect(() => {
    if (card) setForm(card);
  }, [card]);

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof saveFn>[0]["data"]) => saveFn({ data: payload }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["my-business-card"], updated);
      toast.success("Card updated. Everyone holding your link sees it immediately.");
    },
    onError: (err: Error) => toast.error(err.message || "Could not save your card."),
  });

  const set = <K extends keyof BusinessCard>(key: K, value: BusinessCard[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handle = profile?.handle ?? null;
  const name = profile?.display_name ?? profile?.full_name ?? "Your card";

  const save = () =>
    mutation.mutate({
      headline: form.headline ?? null,
      job_title: form.job_title ?? null,
      company: form.company ?? null,
      hero_media_url: form.hero_media_url ?? null,
      background_url: form.background_url ?? null,
      theme: (form.theme as "midnight") ?? "midnight",
      accent: (form.accent as "gold") ?? "gold",
      cta_label: form.cta_label ?? null,
      cta_url: form.cta_url ?? null,
      website: form.website ?? null,
      booking_url: form.booking_url ?? null,
      business_hours: form.business_hours ?? null,
      location: form.location ?? null,
      languages: form.languages ?? [],
      certifications: form.certifications ?? [],
      section_order: form.section_order ?? CARD_SECTIONS.map((s) => s.id),
      is_published: form.is_published ?? true,
      show_contact: form.show_contact ?? true,
      commerce_enabled: form.commerce_enabled ?? false,
      payout_provider: (form.payout_provider as "stripe" | null) ?? null,
      payout_url: form.payout_url ?? null,
      payout_display_name: form.payout_display_name ?? null,
    });

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-12">
      <header className="space-y-3">
        <p className={heading}>FRASS-0426 · Universal Digital Identity</p>
        <h1 className="text-3xl font-black uppercase tracking-tight">Frass Card</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{CARD_PRINCIPLE}</p>
        <p className="max-w-2xl text-sm text-muted-foreground">
          <strong>What this means in plain English:</strong> this is a business card that updates itself.
          Print the QR on a box today, change your phone number next year, and the box still works — like a
          house number that stays put while you redecorate inside.
        </p>
        {handle ? (
          <div className="flex flex-wrap items-center gap-3">
            <code className="rounded-md border border-border/60 px-2 py-1 text-xs">
              frasskicks.com{cardPath(handle)}
            </code>
            <ShareCardButton handle={handle} name={name} />
            <a className="ws-chip" href={cardPath(handle)} target="_blank" rel="noreferrer">
              Open my card
            </a>
          </div>
        ) : (
          <p className="text-sm text-amber-500">
            Set a handle under Builder Identity in your profile to switch on your permanent card link.
          </p>
        )}
      </header>

      <section className={panel}>
        <h2 className={heading}>Identity</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Headline" value={form.headline} onChange={(v) => set("headline", v)} placeholder="Builder, founder, creator" />
          <Field label="Job title" value={form.job_title} onChange={(v) => set("job_title", v)} />
          <Field label="Business name" value={form.company} onChange={(v) => set("company", v)} />
          <Field label="Website" value={form.website} onChange={(v) => set("website", v)} placeholder="https://" />
          <Field label="Booking link" value={form.booking_url} onChange={(v) => set("booking_url", v)} placeholder="https://" />
          <Field label="Location (optional)" value={form.location} onChange={(v) => set("location", v)} />
          <Field label="Business hours (optional)" value={form.business_hours} onChange={(v) => set("business_hours", v)} />
          <Field label="Hero video or image URL" value={form.hero_media_url} onChange={(v) => set("hero_media_url", v)} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <ListField
            label="Languages spoken"
            values={form.languages ?? []}
            onChange={(v) => set("languages", v)}
          />
          <ListField
            label="Certifications"
            values={form.certifications ?? []}
            onChange={(v) => set("certifications", v)}
          />
        </div>
        <div className="mt-4 space-y-2">
          <Label className="text-xs">Call to action</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input value={form.cta_label ?? ""} placeholder="Work with me" onChange={(e) => set("cta_label", e.target.value)} />
            <Input value={form.cta_url ?? ""} placeholder="https://" onChange={(e) => set("cta_url", e.target.value)} />
          </div>
        </div>
      </section>

      <section className={panel}>
        <h2 className={heading}>Presentation</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The card stays recognisably Frass while carrying your personality.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {Object.entries(CARD_THEMES).map(([id, t]) => (
            <button
              key={id}
              type="button"
              onClick={() => set("theme", id)}
              className={`rounded-xl border p-3 text-left text-sm transition ${
                (form.theme ?? "midnight") === id ? "border-primary" : "border-border/60"
              }`}
              style={{ background: t.wash, color: t.ink }}
            >
              <span className="font-semibold">{t.label}</span>
              <span className="mt-1 block text-[11px] opacity-70">{t.note}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {Object.entries(CARD_ACCENTS).map(([id, value]) => (
            <button
              key={id}
              type="button"
              aria-label={`Accent ${id}`}
              onClick={() => set("accent", id)}
              className={`h-9 w-9 rounded-full border-2 transition ${
                (form.accent ?? "gold") === id ? "border-foreground scale-110" : "border-transparent"
              }`}
              style={{ background: value }}
            />
          ))}
        </div>
        <Field
          className="mt-4"
          label="Background image URL (optional)"
          value={form.background_url}
          onChange={(v) => set("background_url", v)}
        />
        <div className="mt-5 space-y-3">
          <Toggle
            label="Card is live"
            hint="Turn off to take your card offline without deleting anything."
            checked={form.is_published ?? true}
            onChange={(v) => set("is_published", v)}
          />
          <Toggle
            label="Show contact section"
            hint="Hides email and phone from visitors while keeping your links visible."
            checked={form.show_contact ?? true}
            onChange={(v) => set("show_contact", v)}
          />
        </div>
      </section>

      <section className={panel}>
        <h2 className={heading}>FRASS-0427 · Payments</h2>
        <p className="mt-2 text-sm text-muted-foreground">{CARD_COMMERCE_PRINCIPLE}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          <strong>What this means in plain English:</strong> your card becomes a till you carry in your
          pocket. The money lands in your own account — Frass keeps the receipt book so your income,
          allocation and taxes stay in one place.
        </p>

        <div className="mt-5 space-y-3">
          <Toggle
            label="Selling switched on"
            hint="Shows your items and a Buy button on your public card."
            checked={form.commerce_enabled ?? false}
            onChange={(v) => set("commerce_enabled", v)}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs">Payment provider</Label>
            <select
              className="h-10 w-full rounded-md border border-border/60 bg-background px-3 text-sm"
              value={form.payout_provider ?? ""}
              onChange={(e) => set("payout_provider", e.target.value || null)}
            >
              <option value="">Not connected yet</option>
              {PAYOUT_PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} — {p.feeNote}
                </option>
              ))}
            </select>
          </div>
          <Field
            label="Your secure payment link"
            value={form.payout_url}
            onChange={(v) => set("payout_url", v)}
            placeholder="https://"
          />
          <Field
            label="Name buyers will see on their statement"
            value={form.payout_display_name}
            onChange={(v) => set("payout_display_name", v)}
          />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {PAYOUT_PROVIDERS.find((p) => p.id === form.payout_provider)?.hint ??
            "Connect any payment account you already control. Frass never holds your money."}
        </p>
      </section>

      <div className="flex gap-3">
        <Button onClick={save} disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Save card"}
        </Button>
      </div>

      <section className={panel} id="analytics">
        <h2 className={heading}>Analytics · last 90 days</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Everything is measurable. Zeros are shown honestly — no invented activity.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {CARD_EVENT_ORDER.map((kind) => (
            <div key={kind} className="rounded-xl border border-border/60 p-4">
              <span className="text-2xl font-black">{analytics?.totals?.[kind] ?? 0}</span>
              <p className="mt-1 text-xs text-muted-foreground">{CARD_EVENT_LABELS[kind]}</p>
            </div>
          ))}
        </div>
      </section>

      <QuickSellPanel provider={form.payout_provider} />

      <PageFeedback pageTitle="Frass Card" />
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value?: string | null;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label className="text-xs">{label}</Label>
      <Input value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function ListField({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label} (one per line)</Label>
      <Textarea
        rows={3}
        value={values.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
      />
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border/60 p-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
