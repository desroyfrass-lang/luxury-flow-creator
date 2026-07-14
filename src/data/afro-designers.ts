import designer1 from "@/assets/afro-designer-1.jpg.asset.json";
import designer2 from "@/assets/afro-designer-2.jpg.asset.json";
import designer3 from "@/assets/afro-designer-3.jpg.asset.json";
import designer4 from "@/assets/afro-designer-4.jpg.asset.json";
import designer5 from "@/assets/afro-designer-5.jpg.asset.json";
import designer6 from "@/assets/afro-designer-6.jpg.asset.json";

export type RegionSlug =
  | "african"
  | "african-american"
  | "caribbean"
  | "jamaican"
  | "diaspora";

export type Region = {
  slug: RegionSlug;
  title: string;
  tagline: string;
  blurb: string;
  subcategories: string[];
};

export const REGIONS: Region[] = [
  {
    slug: "african",
    title: "African Designers",
    tagline: "Heritage reimagined",
    blurb:
      "Designers rooted in the vibrancy, craftsmanship, and futurism of the African continent.",
    subcategories: [
      "Traditional Wear",
      "Modern African Fashion",
      "Luxury Streetwear",
      "Contemporary",
      "Accessories",
    ],
  },
  {
    slug: "caribbean",
    title: "Caribbean Designers",
    tagline: "Island luxury",
    blurb:
      "Resort wear, swim, and tropical luxury from the islands that shaped the vibe.",
    subcategories: [
      "Resort Wear",
      "Island Fashion",
      "Swimwear",
      "Tropical Luxury",
      "Handmade Accessories",
    ],
  },
  {
    slug: "african-american",
    title: "African American Designers",
    tagline: "Culture in motion",
    blurb:
      "Streetwear, contemporary luxury, and cultural collections from designers across the US.",
    subcategories: [
      "Streetwear",
      "Luxury Fashion",
      "Contemporary",
      "Cultural Collections",
      "Emerging Designers",
    ],
  },
  {
    slug: "jamaican",
    title: "Jamaican Designers",
    tagline: "Yaad to the world",
    blurb:
      "Dancehall energy, island luxury, and heritage craft — straight from Jamaica.",
    subcategories: [
      "Dancehall Fashion",
      "Island Luxury",
      "Resort Wear",
      "Handmade Fashion",
      "Jamaican Heritage",
    ],
  },
  {
    slug: "diaspora",
    title: "Global Diaspora Designers",
    tagline: "One vibration, worldwide",
    blurb:
      "Couture, modern luxury, and independent labels from the diaspora across the globe.",
    subcategories: [
      "Couture",
      "Modern Luxury",
      "Independent Brands",
      "Limited Collections",
      "Exclusive Drops",
    ],
  },
];

export type Designer = {
  slug: string;
  name: string;
  studio: string;
  region: RegionSlug;
  country: string;
  flag: string;
  tagline: string;
  story: string;
  image: string;
  featured?: boolean;
};

export const DESIGNERS: Designer[] = [
  {
    slug: "maison-akwete",
    name: "Maison Akwete",
    studio: "Accra Atelier",
    region: "african",
    country: "Ghana",
    flag: "🇬🇭",
    tagline: "Wax print reimagined for the modern muse.",
    story:
      "A womenswear house working with West African textile artisans to translate ancestral wax prints into evening couture.",
    image: designer1.url,
    featured: true,
  },
  {
    slug: "isle-formal",
    name: "Isle Formal",
    studio: "Kingston · Miami",
    region: "jamaican",
    country: "Jamaica",
    flag: "🇯🇲",
    tagline: "Resort tailoring for island gentlemen.",
    story:
      "Linen suiting and boat-day essentials crafted between Kingston and Miami, built for humidity and elegance in equal measure.",
    image: designer2.url,
    featured: true,
  },
  {
    slug: "coral-artisans",
    name: "Coral Artisans Co.",
    studio: "Bridgetown Studio",
    region: "caribbean",
    country: "Barbados",
    flag: "🇧🇧",
    tagline: "Handmade jewelry & accessories.",
    story:
      "A collective of Bajan makers producing shell, raffia, and gold-plated pieces sourced along the island's east coast.",
    image: designer3.url,
    featured: true,
  },
  {
    slug: "north-star-atelier",
    name: "North Star Atelier",
    studio: "Brooklyn, NY",
    region: "african-american",
    country: "USA",
    flag: "🇺🇸",
    tagline: "Streetwear built for the culture.",
    story:
      "Oversized silhouettes, heirloom prints, and hand-embroidered detailing from a Brooklyn-based womenswear label.",
    image: designer4.url,
    featured: true,
  },
  {
    slug: "villa-aurora",
    name: "Villa Aurora",
    studio: "Port-of-Spain",
    region: "caribbean",
    country: "Trinidad & Tobago",
    flag: "🇹🇹",
    tagline: "Bridal & occasion couture.",
    story:
      "Chiffon, silk, and hand-beaded couture gowns designed for destination weddings and island celebrations.",
    image: designer5.url,
  },
  {
    slug: "carnaval-couture",
    name: "Carnaval Couture",
    studio: "Kingston · Bridgetown",
    region: "jamaican",
    country: "Jamaica",
    flag: "🇯🇲",
    tagline: "Where dancehall meets luxury.",
    story:
      "Statement pieces built for carnival, festivals, and the front row — designed by a duo splitting time between Kingston and Bridgetown.",
    image: designer6.url,
  },
];

export function getDesigner(slug: string) {
  return DESIGNERS.find((d) => d.slug === slug);
}

export function getRegion(slug: string) {
  return REGIONS.find((r) => r.slug === slug);
}

export function designersByRegion(slug: RegionSlug) {
  return DESIGNERS.filter((d) => d.region === slug);
}

export const ISLAND_COLLECTIONS = [
  { title: "Resort Wear", note: "Linen, chiffon, ease." },
  { title: "Swim & Beach", note: "Coastline-ready silhouettes." },
  { title: "Sandals & Slides", note: "Handmade, sun-worn leather." },
  { title: "Gold & Shell Jewelry", note: "Ocean-inspired ornament." },
  { title: "Head-Wraps & Silks", note: "Vivid print, silk finish." },
  { title: "Occasion Couture", note: "Weddings, galas, carnivals." },
];
