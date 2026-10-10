import { useState } from "react";
import { PRIMARY_STORES } from "@/lib/taxonomy/registry";
import { TAXONOMY_PATHS, classificationBreadcrumb } from "@/lib/taxonomy/hierarchy";
import { isPilotCategoryAllowed, isEditableProductCategory } from "@/lib/vendors/cj-pilot";

export function PilotCategoryPicker({ store, category, onChange, mode = "pilot" }: {
  store: string; category: string; onChange: (store: string, category: string) => void; mode?: "pilot" | "edit";
}) {
  const edit = mode === "edit";
  const pilotNote = (ok: boolean) => (edit || ok ? "" : " — not supported for Pilot P1");
  const initial = TAXONOMY_PATHS.find((p) => p.node.key === category);
  const [audience, setAudience] = useState(initial?.audience ?? "");
  const [collection, setCollection] = useState(initial?.collection ?? "");
  const departmentPaths = TAXONOMY_PATHS.filter((p) => p.node.store === store);
  const audiencePaths = departmentPaths.filter((p) => p.audience === audience);
  const collectionPaths = audiencePaths.filter((p) => p.collection === collection);
  const choices = (values: string[]) => [...new Set(values)];
  const selectedStore = PRIMARY_STORES.find((s) => s.id === store)?.title;
  const supported = edit || (store === "drip" && audience === "Women");
  const selectClass = "mt-1 w-full rounded-sm border border-border bg-background px-2 py-2 text-sm";
  return (
    <div className="space-y-3">
      {!edit && <p className="text-xs text-muted-foreground">Browse all nine departments below. This one CJ blouse pilot is approved to save only Frass Drip → Women product categories.</p>}
      {edit && <p className="text-xs text-muted-foreground">Any confirmed product category in the nine departments. Service, pending and age-gated categories cannot be saved.</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs">Department
          <select aria-label="Department" className={selectClass} value={store} onChange={(e) => {
            setAudience(""); setCollection(""); onChange(e.target.value, "");
          }}>
            {PRIMARY_STORES.map((s) => <option key={s.id} value={s.id}>{s.title}{pilotNote(s.id === "drip")}</option>)}
          </select>
        </label>
        <label className="text-xs">Audience / gender
          <select aria-label="Audience / gender" className={selectClass} value={audience} onChange={(e) => {
            setAudience(e.target.value); setCollection(""); onChange(store, "");
          }}>
            <option value="">Choose audience…</option>
            {choices(departmentPaths.map((p) => p.audience)).map((a) => <option key={a} value={a}>{a}{pilotNote(store === "drip" && a === "Women")}</option>)}
          </select>
        </label>
        <label className="text-xs">Collection
          <select aria-label="Collection" className={selectClass} disabled={!audience} value={collection} onChange={(e) => {
            setCollection(e.target.value); onChange(store, "");
          }}>
            <option value="">Choose collection…</option>
            {choices(audiencePaths.map((p) => p.collection)).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="text-xs">Subcategory
          <select aria-label="Subcategory" className={selectClass} disabled={!collection} value={category} onChange={(e) => onChange(store, e.target.value)}>
            <option value="">Choose subcategory…</option>
            {collectionPaths.map((p) => <option key={p.node.key} value={p.node.key}>{p.subcategory}{edit ? (isEditableProductCategory(store, p.node.key) ? "" : " — not a product category") : pilotNote(isPilotCategoryAllowed(store, p.node.key))}</option>)}
          </select>
        </label>
      </div>
      <p className="text-sm break-words" aria-label="Selected classification">{category ? classificationBreadcrumb(category) : [selectedStore, audience, collection].filter(Boolean).join(" → ") + " → Choose subcategory"}</p>
      {!supported && <p className="text-xs text-destructive" role="status">This department or audience is not approved for Pilot P1. Choose Frass Drip → Women to save. Browsing here changes no saved product.</p>}
    </div>
  );
}