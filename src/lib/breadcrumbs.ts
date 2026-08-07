import { getCollectionMeta } from "@/lib/shopify";

export interface Crumb {
  label: string;
  to?: string;
}

const DISTRICT: Crumb = { label: "Frass District", to: "/" };

const KICKS_TYPE: Record<string, string> = {
  casual: "Casual Kicks",
  classic: "Classic Kicks",
  street: "Street Kicks",
};

const DRIP_CATEGORY_LABEL: Record<string, string> = {
  work: "Work Drip",
  party: "Party Drip",
  casual: "Casual Drip",
  street: "Street Drip",
  vacay: "Vacay Drip",
  sport: "Sport Drip",
  crown: "Crown Drip",
  extra: "Extra Drip",
};

const BARE_CATEGORY_LABEL: Record<string, string> = {
  swimwear: "Swimwear",
  underwear: "Underwear",
  lingerie: "Lingerie",
  shapewear: "Shapewear",
  panties: "Panties",
  bras: "Bras",
};

function titleize(s: string) {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Base trail for any store: Home / Frass District / <Store> for <Gender> */
export function storeCrumbs(
  store: "kicks" | "drip" | "bare",
  gender: "men" | "women",
): Crumb[] {
  const g = gender === "men" ? "Men" : "Women";
  const map = {
    kicks: { label: `Frass Kicks for ${g}`, to: `/frass-kicks/${gender}` },
    drip: { label: `Frass Drip for ${g}`, to: `/frass-drip/${gender}` },
    bare: { label: `Bare Drip for ${g}`, to: `/bare-drip/${gender}` },
  } as const;
  return [DISTRICT, { ...map[store] }];
}

/**
 * Full breadcrumb trail for a collection handle, e.g.
 * "casual-kicks-men" -> Home / Frass District / Frass Kicks for Men / Men's Casual Kicks
 */
export function collectionCrumbs(handle: string): Crumb[] {
  const title = getCollectionMeta(handle).title;

  const kicks = handle.match(/^(street|classic|casual)-kicks-(men|women)$/);
  if (kicks) {
    const [, type, gender] = kicks;
    return [
      ...storeCrumbs("kicks", gender as "men" | "women"),
      { label: KICKS_TYPE[type] ?? titleize(type) },
    ];
  }

  const drip = handle.match(
    /^(mens|womens)-(work|party|casual|street|vacay|sport|crown|extra)-drip(?:-(.+))?$/,
  );
  if (drip) {
    const [, g, cat, sub] = drip;
    const gender = g === "mens" ? "men" : "women";
    const trail = [
      ...storeCrumbs("drip", gender),
      {
        label: DRIP_CATEGORY_LABEL[cat] ?? titleize(cat),
        ...(sub ? { to: `/frass-drip/${gender}/${cat}` } : {}),
      },
    ];
    if (sub) trail.push({ label: titleize(sub) });
    return trail;
  }

  const bare = handle.match(
    /^(mens|womens)-bare-drip-(swimwear|underwear|lingerie|shapewear|panties|bras)(?:-(.+))?$/,
  );
  if (bare) {
    const [, g, cat, sub] = bare;
    const gender = g === "mens" ? "men" : "women";
    const trail = [
      ...storeCrumbs("bare", gender),
      {
        label: BARE_CATEGORY_LABEL[cat] ?? titleize(cat),
        ...(sub ? { to: `/bare-drip/${gender}/${cat}` } : {}),
      },
    ];
    if (sub) trail.push({ label: titleize(sub) });
    return trail;
  }

  return [DISTRICT, { label: title }];
}
