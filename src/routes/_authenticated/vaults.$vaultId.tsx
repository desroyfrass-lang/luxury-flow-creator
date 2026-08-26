// FRASS-0610 — The Vault shell. You always know which Vault you're standing in.
import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { getVault, listMyVaults } from "@/lib/vault-engine/vaults.functions";
import { categoryMeta, moduleById } from "@/lib/vault-engine/registry";
import { setActiveVaultId } from "@/lib/vault-engine/active-vault";

export const Route = createFileRoute("/_authenticated/vaults/$vaultId")({
  head: () => ({
    meta: [
      { title: "Vault — Frass Hill" },
      {
        name: "description",
        content: "An owned Frass Hill workspace: your sections, your records, your rules.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: VaultShell,
});

function VaultShell() {
  const { vaultId } = Route.useParams();
  const navigate = useNavigate();
  const fetchVault = useServerFn(getVault);
  const listVaults = useServerFn(listMyVaults);
  const [switcher, setSwitcher] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["vault", vaultId],
    queryFn: () => fetchVault({ data: { vaultId } }),
  });
  const others = useQuery({ queryKey: ["my-vaults"], queryFn: () => listVaults(), enabled: switcher });

  useEffect(() => {
    if (data?.vault) setActiveVaultId(data.vault.id);
  }, [data]);

  if (isLoading) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-5xl px-6 py-24 text-sm text-muted-foreground">
          Opening the Vault…
        </div>
      </SiteShell>
    );
  }

  if (!data?.vault) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-3xl px-6 py-24">
          <h1 className="font-display text-3xl">That Vault isn't yours to open.</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Either it doesn't exist, or you're not a member of it. Nothing was shown to you by
            mistake.
          </p>
          <Link to="/vaults" className="mt-6 inline-block text-sm text-[color:var(--gold)] underline">
            Back to My Vaults
          </Link>
        </div>
      </SiteShell>
    );
  }

  const vault = data.vault;
  const meta = categoryMeta(vault.category);
  const sections = vault.enabled_modules.filter((m) => !vault.hidden_modules.includes(m));

  return (
    <SiteShell>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-2xl border border-[color:var(--gold)]/40 bg-background/70 p-6 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[color:var(--gold)]">
                {meta?.glyph} You are inside
              </div>
              <h1 className="mt-1 font-display text-3xl">{vault.name}</h1>
            </div>
            <div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.25em]">
              <button
                type="button"
                onClick={() => setSwitcher((s) => !s)}
                className="rounded-sm border border-border px-4 py-2 text-muted-foreground transition hover:border-[color:var(--gold)]"
              >
                Switch Vault
              </button>
              <Link
                to="/vaults/$vaultId/customize"
                params={{ vaultId }}
                className="rounded-sm border border-border px-4 py-2 text-muted-foreground transition hover:border-[color:var(--gold)]"
              >
                Customize
              </Link>
              <Link
                to="/vaults"
                className="rounded-sm border border-border px-4 py-2 text-muted-foreground transition hover:border-[color:var(--gold)]"
              >
                My Vaults
              </Link>
            </div>
          </div>

          {switcher && (
            <div className="mt-5 grid gap-2 border-t border-border/60 pt-5">
              {(others.data ?? []).map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setSwitcher(false);
                    void navigate({ to: "/vaults/$vaultId", params: { vaultId: v.id } });
                  }}
                  className={`rounded-sm border px-4 py-3 text-left text-sm transition hover:border-[color:var(--gold)] ${
                    v.id === vaultId ? "border-[color:var(--gold)]/60" : "border-border/60"
                  }`}
                >
                  {categoryMeta(v.category)?.glyph} {v.name}
                  {v.id === vaultId && (
                    <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      You're here
                    </span>
                  )}
                </button>
              ))}
              {others.isLoading && (
                <p className="text-sm text-muted-foreground">Fetching your other Vaults…</p>
              )}
            </div>
          )}

          <nav className="mt-6 flex flex-wrap gap-2 border-t border-border/60 pt-5">
            {sections.map((id) => {
              const m = moduleById(id);
              if (!m) return null;
              return m.id === "home" ? (
                <Link
                  key={id}
                  to="/vaults/$vaultId"
                  params={{ vaultId }}
                  activeOptions={{ exact: true }}
                  activeProps={{ className: "border-[color:var(--gold)] text-[color:var(--gold)]" }}
                  className="rounded-full border border-border px-4 py-2 text-xs transition hover:border-[color:var(--gold)]"
                >
                  {m.glyph} {m.name}
                </Link>
              ) : (
                <Link
                  key={id}
                  to="/vaults/$vaultId/m/$moduleId"
                  params={{ vaultId, moduleId: id }}
                  activeProps={{ className: "border-[color:var(--gold)] text-[color:var(--gold)]" }}
                  className="rounded-full border border-border px-4 py-2 text-xs transition hover:border-[color:var(--gold)]"
                >
                  {m.glyph} {m.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <Outlet />
      </div>
    </SiteShell>
  );
}
