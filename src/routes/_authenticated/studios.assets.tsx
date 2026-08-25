// FRASS-0600 — one reusable library for everything the studio owns.
import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAssets, useSeries } from "@/lib/studios/use-studios";
import { EmptyState, Field, GoldButton, QuietButton, StudioCard, inputClass } from "@/components/studios/studio-ui";
import { ASSET_TYPES, RIGHTS_STATUSES, labelFor, prettify } from "@/lib/studios/studios";

type Search = { type?: string };

export const Route = createFileRoute("/_authenticated/studios/assets")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    type: typeof search.type === "string" ? search.type : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Asset Library | Frassy Studios" },
      { name: "description", content: "Characters, voices, music, locations and finished media the studio can reuse." },
      { property: "og:title", content: "Asset Library | Frassy Studios" },
      { property: "og:description", content: "Reuse costs nothing. Regeneration costs money." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AssetsPage,
});

function AssetsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: assets = [] } = useAssets(search.type);
  const { data: series = [] } = useSeries();
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    name: "",
    asset_type: search.type ?? "image",
    series_id: "",
    file_url: "",
    source: "",
    rights_status: "frass_owned",
    tags: "",
  });

  const create = async () => {
    if (!form.name.trim()) return toast.error("Give the asset a name.");
    const { data: user } = await supabase.auth.getUser();
    const { error } = await supabase.from("studio_assets").insert({
      name: form.name.trim(),
      asset_type: form.asset_type,
      series_id: form.series_id || null,
      file_url: form.file_url || null,
      source: form.source || null,
      rights_status: form.rights_status,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      created_by: user.user?.id ?? null,
    });
    if (error) return toast.error(error.message);
    setForm({ ...form, name: "", file_url: "", tags: "" });
    setAdding(false);
    toast.success("Saved to the library. Reuse it and the studio spends nothing.");
    qc.invalidateQueries({ queryKey: ["studio"] });
  };

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-tight">
            {search.type ? labelFor(ASSET_TYPES, search.type) : "Asset Library"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Everything reusable in one place, with who owns it and whether it may be used again.
          </p>
        </div>
        <GoldButton onClick={() => setAdding((a) => !a)}>{adding ? "Close" : "+ Add asset"}</GoldButton>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => navigate({ to: "/studios/assets", search: {} })}
          className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${
            !search.type ? "border-[color:var(--gold)] text-[color:var(--gold)]" : "border-border text-muted-foreground"
          }`}
        >
          All
        </button>
        {ASSET_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => navigate({ to: "/studios/assets", search: { type: t.value } })}
            className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${
              search.type === t.value ? "border-[color:var(--gold)] text-[color:var(--gold)]" : "border-border text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {adding ? (
        <div className="mt-5">
          <StudioCard title="New asset">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name">
                <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Type">
                <select className={inputClass} value={form.asset_type} onChange={(e) => setForm({ ...form, asset_type: e.target.value })}>
                  {ASSET_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Series">
                <select className={inputClass} value={form.series_id} onChange={(e) => setForm({ ...form, series_id: e.target.value })}>
                  <option value="">Any series</option>
                  {series.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="File or reference (URL)">
                <input className={inputClass} value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} />
              </Field>
              <Field label="Source">
                <input className={inputClass} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
              </Field>
              <Field label="Rights">
                <select
                  className={inputClass}
                  value={form.rights_status}
                  onChange={(e) => setForm({ ...form, rights_status: e.target.value })}
                >
                  {RIGHTS_STATUSES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tags" hint="Comma separated.">
                <input className={inputClass} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              </Field>
            </div>
            <div className="mt-4">
              <GoldButton onClick={create}>Save asset</GoldButton>
            </div>
          </StudioCard>
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {assets.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3">
            <EmptyState title="Nothing saved here yet" body="Save an approved asset once and the studio can use it forever." />
          </div>
        ) : null}
        {assets.map((a) => (
          <StudioCard key={a.id} eyebrow={prettify(a.asset_type)} title={a.name}>
            {a.file_url && ["image", "thumbnail", "character", "background", "location"].includes(a.asset_type) ? (
              <img src={a.file_url} alt={a.name} className="mb-3 h-40 w-full rounded-sm object-cover" loading="lazy" />
            ) : null}
            <dl className="space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between gap-3">
                <dt>Rights</dt>
                <dd>{prettify(a.rights_status)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Reuse</dt>
                <dd>{a.reuse_allowed ? "Allowed" : "Blocked"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Approved</dt>
                <dd>{a.approved ? "Yes" : "No"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Last used</dt>
                <dd>{a.last_used_at ? new Date(a.last_used_at).toLocaleDateString() : "Never"}</dd>
              </div>
            </dl>
            <div className="mt-3 flex flex-wrap gap-2">
              <QuietButton
                onClick={async () => {
                  await supabase.from("studio_assets").update({ approved: !a.approved }).eq("id", a.id);
                  qc.invalidateQueries({ queryKey: ["studio"] });
                }}
              >
                {a.approved ? "Unapprove" : "Approve"}
              </QuietButton>
              <QuietButton
                onClick={async () => {
                  await supabase.from("studio_assets").update({ reuse_allowed: !a.reuse_allowed }).eq("id", a.id);
                  qc.invalidateQueries({ queryKey: ["studio"] });
                }}
              >
                {a.reuse_allowed ? "Block reuse" : "Allow reuse"}
              </QuietButton>
            </div>
          </StudioCard>
        ))}
      </div>
    </>
  );
}
