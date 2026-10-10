/** Presentation-only supplier options. Unknown label formats stay intact. */
export type VisualVariant = { id?: string; ref: string; sku: string | null; label: string | null; image: string | null };
export type VariantGroup = { colour: string; variants: Array<VisualVariant & { size: string | null }> };

export function groupVisualVariants(variants: readonly VisualVariant[]): VariantGroup[] {
  const groups = new Map<string, VariantGroup>();
  for (const v of variants) {
    // CJ's colour-size suffix is explicit; never split an arbitrary product label.
    const match = v.label?.match(/^(.+)-(XXXS|XXS|XS|S|M|L|XL|XXL|XXXL|[2-9]XL)$/);
    const colour = match?.[1] ?? v.label ?? v.sku ?? v.ref;
    const size = match?.[2] ?? null;
    const group = groups.get(colour) ?? { colour, variants: [] };
    group.variants.push({ ...v, image: v.image?.startsWith("https://") ? v.image : null, size });
    groups.set(colour, group);
  }
  return [...groups.values()];
}

export function selectedVisualVariant(variants: readonly VisualVariant[], ref: string | null): VisualVariant | null {
  return variants.find((v) => v.ref === ref) ?? null;
}