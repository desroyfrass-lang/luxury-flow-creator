import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { getProductHandoff } from "@/lib/vendors/product-handoff.functions";
import type { ProductHandoff } from "@/lib/vendors/product-handoff";
import { groupVisualVariants, selectedVisualVariant, type VisualVariant } from "@/lib/vendors/variant-selection";

/** Local selection only: no writes, creative calls or gallery-to-colour guesses. */
export function SupplierVariantPicker({ variants, productId }: { variants: readonly VisualVariant[]; productId?: string }) {
  const [selectedRef, setSelectedRef] = useState<string | null>(null);
  const [handoff, setHandoff] = useState<ProductHandoff | null>(null);
  const [handoffError, setHandoffError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const fetchHandoff = useServerFn(getProductHandoff);
  const choose = (ref: string) => { setSelectedRef(ref); setHandoff(null); setHandoffError(null); };
  const prepare = async (variantId: string) => {
    if (!productId) return;
    setChecking(true); setHandoffError(null);
    try { setHandoff(await fetchHandoff({ data: { productId, variantId } })); }
    catch (e) { setHandoff(null); setHandoffError(e instanceof Error ? e.message : "Could not check this selection."); }
    finally { setChecking(false); }
  };
  const [failed, setFailed] = useState<string[]>([]);
  const groups = groupVisualVariants(variants);
  const selected = selectedVisualVariant(variants, selectedRef);
  const group = groups.find((g) => g.variants.some((v) => v.ref === selected?.ref));
  const markFailed = (url: string) => setFailed((previous) => previous.includes(url) ? previous : [...previous, url]);
  if (!groups.length) return null;

  return (
    <div className="mt-4 space-y-3" aria-label="Supplier colour and size selection">
      <div className="text-xs font-medium">Colour / size</div>
      <div className="flex flex-wrap gap-2">
        {groups.map((g) => {
          const first = g.variants[0];
          if (!first) return null;
          const photo = g.variants.find((v) => v.image)?.image;
          return (
            <Button key={g.colour} type="button" variant="outline" aria-label={`Select ${g.colour}`} aria-pressed={group?.colour === g.colour}
              className="h-auto w-28 flex-col whitespace-normal p-2 aria-pressed:border-primary aria-pressed:ring-1 aria-pressed:ring-ring"
              onClick={() => choose(first.ref)}>
              {photo && !failed.includes(photo) ? (
                <img src={photo} alt={`${g.colour} · CJ variant photo`} className="h-24 w-full rounded-sm object-contain" onError={() => markFailed(photo)} />
              ) : <span className="flex h-24 w-full items-center justify-center text-center text-xs text-muted-foreground">{photo ? "CJ variant photo did not load" : "No variant-linked photo"}</span>}
              <span className="text-xs">{g.colour}</span>
            </Button>
          );
        })}
      </div>
      {selected && group ? (
        <div className="space-y-3">
          <div className="flex aspect-square w-full max-w-sm items-center justify-center border border-border bg-background" aria-label="Selected variant preview">
            {selected.image && !failed.includes(selected.image) ? (
              <img src={selected.image} alt={`Selected CJ variant ${selected.label ?? selected.ref}`} className="h-full w-full object-contain" onError={() => { if (selected.image) markFailed(selected.image); }} />
            ) : <p className="p-4 text-center text-xs text-muted-foreground">{selected.image ? "CJ variant photo did not load." : "No authentic photo is linked to this variant."} The general gallery stays separate.</p>}
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Saved size combinations">
            {group.variants.map((v) => (
              <Button key={v.ref} type="button" size="sm" variant="outline" aria-label={`Select variant ${v.label ?? v.ref}`} aria-pressed={selected.ref === v.ref}
                className="aria-pressed:border-primary aria-pressed:ring-1 aria-pressed:ring-ring" onClick={() => choose(v.ref)}>{v.size ?? v.label ?? v.ref}</Button>
            ))}
          </div>
          <div className="break-all text-xs text-muted-foreground" role="status">
            Selected: {selected.label ?? selected.ref} · SKU: {selected.sku ?? "not supplied"} · CJ variant ID: {selected.ref}
          </div>
          {productId && selected.id ? (
            <div className="space-y-2 rounded-sm border border-dashed border-border p-3" aria-label="Product handoff">
              <Button type="button" size="sm" variant="outline" disabled={checking} onClick={() => prepare(selected.id!)}>{checking ? "Checking…" : "Prepare verified handoff"}</Button>
              {handoffError ? <p className="text-xs text-destructive" role="alert">{handoffError}</p> : null}
              {handoff ? (
                <div className="space-y-0.5 break-all text-xs" role="status">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Verified from saved records · ready for future tools</div>
                  <div>{handoff.name} · {handoff.categoryPath}</div>
                  <div>{handoff.variant.colour}{handoff.variant.size ? ` / ${handoff.variant.size}` : ""} · SKU {handoff.variant.sku ?? "not supplied"} · variant {handoff.variant.sourceVariantRef}</div>
                  <div>Photo: {handoff.photo.url ? "authentic supplier variant photo" : handoff.photo.reason}</div>
                </div>
              ) : null}
              <p className="text-[10px] text-muted-foreground">Checks only. Nothing is sent to Capsules, Try-On or FV Studios yet, and nothing is saved or charged.</p>
            </div>
          ) : null}
        </div>
      ) : null}
      <p className="text-[10px] text-muted-foreground">CJ-listed combinations only; stock and delivery are not verified. Selection stays on this screen, resets on reload, and is not sent to other tools.</p>
    </div>
  );
}