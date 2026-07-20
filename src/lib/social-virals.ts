import cardBare from "@/assets/card-bare.jpg";
import cardDrip from "@/assets/card-drip.jpg";
import cardKicks from "@/assets/card-kicks.jpg";
import cardMen from "@/assets/card-men.jpg";
import cardWomen from "@/assets/card-women.jpg";
import bouncyDress from "@/assets/bouncy-viral-dress.jpg";

export const BOUNCY_VIRAL_DRESS_IMG = bouncyDress;

export type ViralProduct = {
  slug: string;
  title: string;
  blurb: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  sold: string;
  badge?: "Viral" | "Hot" | "New" | "Deal" | "Creator Pick";
  image: string;
};

export type ViralSub = {
  slug: string;
  title: string;
  tagline: string;
  products: ViralProduct[];
};

export type ViralCategory = {
  slug: string;
  emoji: string;
  title: string;
  tagline: string;
  image: string;
  subs: ViralSub[];
};

const IMG_POOL = [cardKicks, cardDrip, cardBare, cardMen, cardWomen];

function makeProducts(prefix: string, names: [string, string, number, number?][]): ViralProduct[] {
  return names.map(([title, blurb, price, compareAt], i) => ({
    slug: `${prefix}-${i + 1}`,
    title,
    blurb,
    price,
    compareAt,
    rating: 4.5 + ((i * 0.1) % 0.5),
    reviews: 120 + i * 87,
    sold: `${(1.2 + i * 0.4).toFixed(1)}k sold`,
    badge: (["Viral", "Hot", "New", "Deal", "Creator Pick"] as const)[i % 5],
    image: IMG_POOL[i % IMG_POOL.length],
  }));
}

export const VIRAL_CATEGORIES: ViralCategory[] = [
  {
    slug: "main-event",
    emoji: "✨",
    title: "Main Event",
    tagline: "Showstopper pieces made for the moment.",
    image: bouncyDress,
    subs: [
      {
        slug: "bouncy-dresses",
        title: "Bouncy Dresses",
        tagline: "The tiered, twirl-ready silhouettes going viral.",
        products: [
          {
            slug: "bouncy-viral-dress",
            title: "Bouncy Viral Dress",
            blurb: "Champagne satin, three-tier ruffle, engineered to twirl.",
            price: 78.0,
            compareAt: 128.0,
            rating: 4.9,
            reviews: 1284,
            sold: "6.2k sold",
            badge: "Viral",
            image: bouncyDress,
          },
          {
            slug: "bouncy-viral-dress-noir",
            title: "Bouncy Viral Dress — Noir",
            blurb: "The moment, in liquid black satin.",
            price: 78.0,
            compareAt: 128.0,
            rating: 4.8,
            reviews: 612,
            sold: "2.1k sold",
            badge: "Hot",
            image: bouncyDress,
          },
        ],
      },
    ],
  },
  {
    slug: "trending",
    emoji: "🔥",
    title: "Trending & Viral",
    tagline: "The internet's most-wanted this week.",
    image: cardKicks,
    subs: [
      {
        slug: "tiktok-made-me-buy-it",
        title: "TikTok Made Me Buy It",
        tagline: "The viral drops flooding your FYP.",
        products: makeProducts("tt", [
          ["Cloud Slides", "The viral pillow-soft slide.", 24.99, 39.99],
          ["Sunset Lamp Projector", "Golden-hour vibes on demand.", 19.99, 34.99],
          ["Mini Waffle Maker", "Single-serve, viral favorite.", 14.99],
          ["Heatless Curl Rod", "Salon curls overnight.", 12.99, 24.99],
          ["Portable Blender", "USB-C smoothies anywhere.", 29.99],
          ["Neck Massager", "60-second tension reset.", 39.99, 79.99],
          ["LED Strip Lights", "16M colors, app control.", 17.99],
          ["Reusable Straw Kit", "TikTok's #1 barista kit.", 9.99],
        ]),
      },
      { slug: "best-sellers", title: "Best Sellers", tagline: "Top movers, restocked weekly.", products: makeProducts("bs", [["Silk Bonnet","Frizz-free mornings.",14.99],["Magnetic Lashes","No glue, no mess.",19.99,29.99],["Ice Roller","De-puff in 60 seconds.",12.99],["Foot Peel Mask","Baby-soft in 7 days.",9.99],["Scalp Massager","Shower must-have.",7.99],["Body Chain","Layered summer glow.",16.99]]) },
      { slug: "new-arrivals", title: "New Arrivals", tagline: "Fresh drops, hot off the algorithm.", products: makeProducts("na", [["Gua Sha Set","Sculpt & drain.",22.99],["Silk Pillowcase","Hair & skin savior.",29.99],["Mini Steamer","Wrinkles gone in seconds.",34.99],["Aromatherapy Diffuser","Ultrasonic mist.",27.99]]) },
      { slug: "flash-deals", title: "Flash Deals", tagline: "Ends in 24h — while supplies last.", products: makeProducts("fd", [["Bluetooth Speaker","Waterproof, 20h play.",24.99,59.99],["Sleep Mask 3D","Zero-pressure comfort.",8.99,19.99],["Peel-Off Mask","Blackhead eraser.",7.99,15.99]]) },
      { slug: "creator-picks", title: "Creator Picks", tagline: "Curated by top creators.", products: makeProducts("cp", [["Lip Oil Duo","Gloss + treatment.",13.99],["Puff Sleeve Top","Creator staple.",29.99],["Chunky Chain Set","Layer up.",18.99]]) },
      { slug: "viral-beauty", title: "Viral Beauty Finds", tagline: "The beauty aisle, disrupted.", products: makeProducts("vb", [["Blurring Primer","Filter-in-a-bottle.",21.99],["Lash Serum","Fuller in 30 days.",26.99],["Hair Growth Oil","Rosemary blend.",15.99]]) },
      { slug: "viral-tech", title: "Viral Tech Finds", tagline: "Gadgets going viral overnight.", products: makeProducts("vt", [["Ring Light Clip","Studio lighting to-go.",14.99],["Magnetic Powerbank","Snap-on, 10k mAh.",34.99],["Mini Fan","4-speed neck fan.",19.99]]) },
      { slug: "viral-problem-solvers", title: "Viral Problem Solvers", tagline: "Life hacks that actually work.", products: makeProducts("ps", [["Cable Organizer","Desk-life saver.",8.99],["Silicone Stretch Lids","Zero-waste kitchen.",11.99],["Wall Hooks","Damage-free, holds 5kg.",6.99]]) },
      { slug: "limited-time", title: "Limited-Time Offers", tagline: "Gone when they're gone.", products: makeProducts("lt", [["Sculpt Wrap","Snatched in 20 min.",29.99,59.99],["Body Oil","Golden shimmer.",22.99,44.99]]) },
    ],
  },
  {
    slug: "tech",
    emoji: "📱",
    title: "Tech & Phone Accessories",
    tagline: "Upgrade the everyday carry.",
    image: cardDrip,
    subs: [
      { slug: "phone-cases", title: "Phone Cases", tagline: "Drop-proof and drip-worthy.", products: makeProducts("pc", [["MagSafe Clear Case","Yellow-proof polymer.",18.99],["Ring-Grip Case","Built-in kickstand.",22.99],["Leather Wallet Case","Card slot + strap.",29.99],["Chrome Mirror Case","Statement finish.",24.99]]) },
      { slug: "chargers", title: "Chargers & Power Banks", tagline: "Fast, wireless, everywhere.", products: makeProducts("ch", [["65W GaN Charger","3-port, foldable.",34.99],["10k MagSafe Bank","Snap-on wireless.",39.99],["3-in-1 Wireless Dock","Phone + watch + buds.",49.99,79.99]]) },
      { slug: "wireless", title: "Wireless Accessories", tagline: "Cut the cord, keep the drip.", products: makeProducts("wl", [["ANC Earbuds","30h with case.",39.99],["Wireless Charger Pad","15W fast.",19.99]]) },
      { slug: "mounts", title: "Phone Mounts & Holders", tagline: "Handsfree, always.", products: makeProducts("mt", [["Car Vent Mount","Magnetic, 360°.",14.99],["Desk Arm Mount","Overhead filming.",29.99]]) },
      { slug: "selfie", title: "Selfie & Camera Accessories", tagline: "Creator kit essentials.", products: makeProducts("sf", [["Tripod Selfie Stick","BT remote.",24.99],["Ring Light Tripod","10-inch, RGB.",39.99]]) },
      { slug: "audio", title: "Audio & Bluetooth", tagline: "Sound that follows you.", products: makeProducts("au", [["Over-Ear Headphones","40h ANC.",89.99],["Party Speaker","IPX7, RGB.",59.99]]) },
      { slug: "smart-gadgets", title: "Smart Gadgets", tagline: "Small tech, big flex.", products: makeProducts("sg", [["Smart Tag 4-Pack","Find anything.",29.99],["Mini Projector","1080p, WiFi.",119.99]]) },
    ],
  },
  {
    slug: "home",
    emoji: "🏡",
    title: "Home & Kitchen",
    tagline: "Elevate every room.",
    image: cardBare,
    subs: [
      { slug: "home-essentials", title: "Home Essentials", tagline: "Everyday upgrades.", products: makeProducts("he", [["Weighted Blanket","15lb, cooling.",49.99],["Memory Foam Pillow","Cervical support.",34.99]]) },
      { slug: "kitchen-essentials", title: "Kitchen Essentials", tagline: "Chef-mode unlocked.", products: makeProducts("ke", [["Air Fryer 5L","Digital touch.",79.99,119.99],["Milk Frother","3-speed handheld.",12.99]]) },
      { slug: "cookware", title: "Cookware & Dining", tagline: "The set that levels you up.", products: makeProducts("cw", [["Non-Stick Pan Set","3-piece ceramic.",59.99],["Stone Mortar & Pestle","Restaurant-grade.",24.99]]) },
      { slug: "decor", title: "Home Décor", tagline: "Aesthetic, delivered.", products: makeProducts("dc", [["Mushroom Lamp","Retro glass.",34.99],["Cloud Mirror","Irregular wall art.",49.99]]) },
      { slug: "organization", title: "Home Organization", tagline: "Clutter, cancelled.", products: makeProducts("or", [["Fridge Bins Set","Clear stackable.",22.99],["Closet Cubes","Fabric, 6-pack.",19.99]]) },
      { slug: "cleaning", title: "Cleaning Essentials", tagline: "Deep clean, quick.", products: makeProducts("cl", [["Electric Spin Scrubber","6 heads.",39.99],["Steam Mop","Sanitizes floors.",59.99]]) },
      { slug: "smart-home", title: "Smart Home", tagline: "The home that responds.", products: makeProducts("sh", [["Smart Bulb 4-Pack","App control.",29.99],["Video Doorbell","2K, wireless.",89.99]]) },
      { slug: "seasonal", title: "Seasonal Home", tagline: "Vibes for every season.", products: makeProducts("sn", [["String Lights 100ft","Warm white.",19.99],["Faux Pumpkin Set","Autumn tabletop.",24.99]]) },
    ],
  },
  {
    slug: "beauty",
    emoji: "💄",
    title: "Beauty & Personal Care",
    tagline: "Glow-up starter pack.",
    image: cardWomen,
    subs: [
      { slug: "skincare", title: "Skincare", tagline: "Glass-skin routine.", products: makeProducts("sk", [["Vitamin C Serum","Brightens in 4 weeks.",19.99],["Retinol Night Cream","Barrier-safe formula.",29.99]]) },
      { slug: "makeup", title: "Makeup", tagline: "Full glam, quick.", products: makeProducts("mk", [["Liquid Blush","Cheek + lip tint.",14.99],["Lash Cluster Kit","DIY extensions.",24.99]]) },
      { slug: "hair-tools", title: "Hair Tools", tagline: "Salon at home.", products: makeProducts("ht", [["Ionic Blow Dryer","Frizz control.",49.99],["Curling Wand 5-in-1","Interchangeable barrels.",59.99]]) },
      { slug: "fragrances", title: "Fragrances", tagline: "Signature scent, sealed.", products: makeProducts("fr", [["Body Mist Set","3 layering scents.",24.99],["Perfume Roll-On","Portable, EDP.",19.99]]) },
      { slug: "bath-body", title: "Bath & Body", tagline: "Spa-day everyday.", products: makeProducts("bb", [["Exfoliating Glove","Silky in one wash.",7.99],["Whipped Body Butter","Shea + cocoa.",16.99]]) },
      { slug: "beauty-devices", title: "Beauty Devices", tagline: "Tech-powered beauty.", products: makeProducts("bd", [["LED Face Mask","7-color therapy.",89.99],["Microcurrent Wand","Snatch in 5 min.",129.99]]) },
    ],
  },
  {
    slug: "wellness",
    emoji: "💪",
    title: "Health & Wellness",
    tagline: "Feel your best.",
    image: cardMen,
    subs: [
      { slug: "fitness", title: "Fitness Equipment", tagline: "Home gym, unlocked.", products: makeProducts("ft", [["Resistance Band Set","5 tensions + bag.",19.99],["Adjustable Dumbbell","5-52.5 lb.",149.99]]) },
      { slug: "wellness-devices", title: "Wellness Devices", tagline: "Track your recovery.", products: makeProducts("wd", [["Smart Scale","Body comp + BMI.",29.99],["Pulse Oximeter","OLED display.",19.99]]) },
      { slug: "recovery", title: "Recovery & Massage", tagline: "Reset and repair.", products: makeProducts("rc", [["Massage Gun","6 heads, quiet.",79.99,159.99],["Foam Roller","EVA, high-density.",24.99]]) },
      { slug: "sleep", title: "Sleep & Relaxation", tagline: "Deep sleep, guaranteed.", products: makeProducts("sl", [["White Noise Machine","20 sounds.",29.99],["Silk Eye Mask","Cooling gel insert.",14.99]]) },
      { slug: "supplements", title: "Vitamins & Supplements", tagline: "Daily essentials.", products: makeProducts("sp", [["Collagen Peptides","Unflavored, 30 servings.",34.99],["Sleep Gummies","Melatonin + L-theanine.",19.99]]) },
      { slug: "personal-care", title: "Personal Care", tagline: "Wellness, everyday.", products: makeProducts("pcw", [["Electric Toothbrush","5 modes, USB-C.",39.99],["Water Flosser","Cordless, IPX7.",44.99]]) },
    ],
  },
  {
    slug: "pets",
    emoji: "🐶",
    title: "Pets",
    tagline: "For the best companions.",
    image: cardKicks,
    subs: [
      { slug: "dogs", title: "Dog Supplies", tagline: "Everything your dog needs.", products: makeProducts("dg", [["No-Pull Harness","Reflective + padded.",24.99],["Slow Feeder Bowl","Vet-approved.",14.99]]) },
      { slug: "cats", title: "Cat Supplies", tagline: "Curated for cats.", products: makeProducts("ct", [["Auto Feeder","Timer + portion control.",49.99],["Cat Tunnel","Collapsible 3-way.",19.99]]) },
      { slug: "pet-health", title: "Pet Health", tagline: "Vet-loved essentials.", products: makeProducts("ph", [["Dental Chews","Vet-formulated.",19.99],["Calming Treats","Anxiety support.",22.99]]) },
      { slug: "cat-accessories", title: "Cat Accessories", tagline: "Style for the sassy.", products: makeProducts("ca", [["Interactive Laser","Auto-rotate.",24.99],["Scratching Post","Sisal + carpet.",39.99]]) },
    ],
  },
];

export function getViralCategory(slug: string) {
  return VIRAL_CATEGORIES.find((c) => c.slug === slug);
}

export function getViralSub(catSlug: string, subSlug: string) {
  const cat = getViralCategory(catSlug);
  return cat ? { cat, sub: cat.subs.find((s) => s.slug === subSlug) } : { cat: undefined, sub: undefined };
}

export function getViralProduct(catSlug: string, subSlug: string, prodSlug: string) {
  const { cat, sub } = getViralSub(catSlug, subSlug);
  return { cat, sub, product: sub?.products.find((p) => p.slug === prodSlug) };
}
