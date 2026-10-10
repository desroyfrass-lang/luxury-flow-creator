import { useState } from "react";
import { Button } from "@/components/ui/button";
import { groupVisualVariants, selectedVisualVariant, type VisualVariant } from "@/lib/vendors/variant-selection";

/** Local selection only: no writes, creative calls or gallery-to-colour guesses. */
export function SupplierVariantPicker({ variants }: { variants: readonly VisualVariant[] }) {
  const [selectedRef, setSelectedRef] = useState<string | null>(null);
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
              onClick={() => setSelectedRef(first.ref)}>
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
                className="aria-pressed:border-primary aria-pressed:ring-1 aria-pressed:ring-ring" onClick={() => setSelectedRef(v.ref)}>{v.size ?? v.label ?? v.ref}</Button>
            ))}
          </div>
          <div className="break-all text-xs text-muted-foreground" role="status">
            Selected: {selected.label ?? selected.ref} · SKU: {selected.sku ?? "not supplied"} · CJ variant ID: {selected.ref}
          </div>
        </div>
      ) : null}
      <p className="text-[10px] text-muted-foreground">CJ-listed combinations only; stock and delivery are not verified. Selection stays on this screen, resets on reload, and is not sent to other tools.</p>
    </div>
  );
}