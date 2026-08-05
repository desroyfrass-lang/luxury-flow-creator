// Academy District — the Builder's lifelong learning campus.
// Client-safe: no server imports.
//
// Constitutional purpose: answer "what does this Builder need to learn next in
// order to reach the future they described to Frassy?" Every lesson is a real
// task, and every module leaves something behind — a project, a document, a
// workflow, a product, a portfolio piece.

export type DistrictLink = "vault" | "creation" | "opportunity" | "marketplace" | "welcome-hall";

export const DISTRICT_LABELS: Record<DistrictLink, string> = {
  vault: "Builder Vault",
  creation: "Creation District",
  opportunity: "Opportunity Center",
  marketplace: "Marketplace",
  "welcome-hall": "Welcome Hall",
};

export const DISTRICT_ROUTES: Record<DistrictLink, string> = {
  vault: "/vault",
  creation: "/creation",
  opportunity: "/opportunity",
  marketplace: "/social-media-virals",
  "welcome-hall": "/welcome-hall",
};

export type Lesson = {
  id: string;
  title: string;
  /** What the Builder actually does — a real task, not a video. */
  task: string;
  minutes: number;
  /** The skill this lesson develops. Rolls up into the Builder's skill map. */
  skill: string;
  /** Frassy speaking as mentor — why this matters, said plainly. */
  mentor: string;
  /** What exists in the world once the lesson is done. */
  produces: string;
  /** Where the work lives once it's made. */
  district?: DistrictLink;
};

export type BuilderPath = {
  id: string;
  name: string;
  /** The identity a Builder is stepping into. */
  identity: string;
  college: string;
  summary: string;
  outcome: string;
  /** Signals from onboarding / profile that make this path the right next step. */
  signals: string[];
  lessons: Lesson[];
};

export const COLLEGES = [
  "College of Craft",
  "College of Commerce",
  "College of Voice",
  "College of Stewardship",
  "College of Service",
] as const;

export const BUILDER_PATHS: BuilderPath[] = [
  {
    id: "entrepreneur",
    name: "Entrepreneur Path",
    identity: "You are building a business that can feed you.",
    college: "College of Commerce",
    summary:
      "Take one idea from a note in your pocket to a thing people pay for — and know your numbers while you do it.",
    outcome: "A live product, a real price, a ledger, and your break-even number said out loud.",
    signals: ["business", "sell", "shop", "store", "brand", "money", "revenue", "entrepreneur"],
    lessons: [
      {
        id: "pick",
        title: "Pick the one idea",
        task: "Write three ideas in your Vault, then cross out two. Keep the one you'd still want to make next month.",
        minutes: 15,
        skill: "Decision making",
        mentor:
          "Three ideas half-built beat nothing, but one idea finished beats all three. Choosing is the work.",
        produces: "A written decision saved in your Vault.",
        district: "vault",
      },
      {
        id: "spec",
        title: "Write the spec",
        task: "In the Creation District, add the product with a name, a short description, and three tags.",
        minutes: 20,
        skill: "Product definition",
        mentor: "If you can't describe it in two sentences, nobody can buy it in one click.",
        produces: "A real product record in the Creation District.",
        district: "creation",
      },
      {
        id: "cost",
        title: "Find your true cost",
        task: "List materials, production, shipping and fees for one unit. That number is your unit cost.",
        minutes: 25,
        skill: "Unit economics",
        mentor:
          "Most first businesses don't fail from no sales. They fail from sales that lose money quietly.",
        produces: "A costing note in your Vault.",
        district: "vault",
      },
      {
        id: "price",
        title: "Price it honestly",
        task: "Set a price on the product that leaves you real profit. Under 40% margin, change something.",
        minutes: 20,
        skill: "Pricing",
        mentor: "Price for the business you want in a year, not for the fear you feel today.",
        produces: "A priced, ready product.",
        district: "creation",
      },
      {
        id: "ledger",
        title: "Open the ledger",
        task: "In the Opportunity Center, log every sale and expense from the last 30 days.",
        minutes: 40,
        skill: "Financial literacy",
        mentor: "Numbers you avoid become numbers that decide for you.",
        produces: "A working money ledger.",
        district: "opportunity",
      },
      {
        id: "drop",
        title: "Ship the first drop",
        task: "Create a drop, attach the product, pick a date, and tell three people who would actually buy.",
        minutes: 30,
        skill: "Shipping",
        mentor: "The first drop is never the best drop. It's the one that makes the rest possible.",
        produces: "A dated drop with a product attached.",
        district: "creation",
      },
    ],
  },
  {
    id: "designer",
    name: "Designer Path",
    identity: "You are building taste other people can recognize.",
    college: "College of Craft",
    summary:
      "Turn instinct into a system — references, palette, silhouette, and a portfolio piece that proves it.",
    outcome: "A design system in your Vault and one finished piece in the Creation District.",
    signals: ["design", "designer", "art", "visual", "aesthetic", "fashion", "streetwear", "style"],
    lessons: [
      {
        id: "references",
        title: "Build the reference wall",
        task: "Save twelve references to your Vault under one collection. Write one line under each: why it works.",
        minutes: 35,
        skill: "Visual research",
        mentor: "Taste isn't magic. It's a wall of things you looked at long enough to understand.",
        produces: "A reference collection in your Vault.",
        district: "vault",
      },
      {
        id: "palette",
        title: "Lock the palette",
        task: "Pick four colours and two materials you'll repeat. Write why each one is in.",
        minutes: 25,
        skill: "Design systems",
        mentor: "Constraints are what make a body of work look like one hand made it.",
        produces: "A written palette and material rule.",
        district: "vault",
      },
      {
        id: "silhouette",
        title: "Draw the silhouette",
        task: "Sketch or mock the piece three ways. Keep the one that reads from across a room.",
        minutes: 45,
        skill: "Form",
        mentor: "If it doesn't read at a distance, the details won't save it.",
        produces: "A chosen silhouette with two rejected options recorded.",
        district: "vault",
      },
      {
        id: "spec",
        title: "Spec it for production",
        task: "In the Creation District, add the piece with materials, sizes and finish notes in the description.",
        minutes: 30,
        skill: "Production spec",
        mentor: "A spec is a promise to the person who has to make it after you.",
        produces: "A production-ready product record.",
        district: "creation",
      },
      {
        id: "portfolio",
        title: "Make the portfolio piece",
        task: "Shoot or render one clean image, attach it, and save the finished piece to your Vault as a portfolio item.",
        minutes: 40,
        skill: "Presentation",
        mentor: "Work nobody can see is work nobody can hire.",
        produces: "A portfolio item.",
        district: "vault",
      },
    ],
  },
  {
    id: "creator",
    name: "Creator Path",
    identity: "You are building an audience that trusts you.",
    college: "College of Voice",
    summary:
      "Find the thing only you can say, then build a rhythm of saying it that you can actually keep.",
    outcome: "A written voice guide, a content rhythm, and your first published series.",
    signals: ["creator", "content", "tiktok", "video", "audience", "follow", "post", "social"],
    lessons: [
      {
        id: "why",
        title: "Write the why",
        task: "Three sentences: who you make for, what you make, why it matters to you. Save to Vault.",
        minutes: 20,
        skill: "Positioning",
        mentor: "People don't follow products. They follow a point of view they can repeat.",
        produces: "A positioning statement.",
        district: "vault",
      },
      {
        id: "words",
        title: "Choose your words",
        task: "List ten words you'd use and five you never would. That's your voice guide.",
        minutes: 20,
        skill: "Brand voice",
        mentor: "Your voice is mostly the words you refuse.",
        produces: "A voice guide document.",
        district: "vault",
      },
      {
        id: "series",
        title: "Design one repeatable series",
        task: "Invent one format you could run fifty times. Name it. Write the first five episodes as titles.",
        minutes: 35,
        skill: "Format design",
        mentor: "Consistency beats brilliance. A format is how you stay consistent on a bad week.",
        produces: "A named series with five planned pieces.",
        district: "vault",
      },
      {
        id: "publish",
        title: "Publish three",
        task: "Ship the first three pieces. Don't polish the fourth before the first is out.",
        minutes: 60,
        skill: "Publishing",
        mentor: "Publishing is a muscle. Nobody gets strong reading about the gym.",
        produces: "Three published pieces.",
      },
      {
        id: "read",
        title: "Read the signal",
        task: "Note which piece got the most real responses and why. Log it as a decision in your Vault.",
        minutes: 20,
        skill: "Audience analysis",
        mentor: "Watch what people do, not what they say. Then make more of the thing they did.",
        produces: "A written audience insight.",
        district: "vault",
      },
      {
        id: "convert",
        title: "Connect it to the shop",
        task: "Put one product in front of the audience with a single clear offer, and log it as an opportunity.",
        minutes: 25,
        skill: "Conversion",
        mentor: "An audience you never ask is a favour you never cash.",
        produces: "A live offer tracked in the Opportunity Center.",
        district: "opportunity",
      },
    ],
  },
  {
    id: "marketing",
    name: "Marketing Path",
    identity: "You are building the road between the work and the buyer.",
    college: "College of Commerce",
    summary:
      "Go from nobody knows you to ten people who bought — and a written reason each one said yes.",
    outcome: "Ten real customers and a repeatable offer you can send tomorrow.",
    signals: ["marketing", "customers", "sales", "growth", "ads", "reach", "promote"],
    lessons: [
      {
        id: "who",
        title: "Name who it's for",
        task: "Describe one specific person who needs what you make. Not 'everyone'. Save it to your Vault.",
        minutes: 20,
        skill: "Customer clarity",
        mentor: "'Everyone' is the most expensive audience in the world.",
        produces: "A written customer profile.",
        district: "vault",
      },
      {
        id: "list",
        title: "Build the list",
        task: "Write 25 people or places that fit. Add the best ten as opportunities.",
        minutes: 40,
        skill: "Pipeline building",
        mentor: "A list is hope turned into something you can work through.",
        produces: "Ten tracked opportunities.",
        district: "opportunity",
      },
      {
        id: "offer",
        title: "Write one clear offer",
        task: "One sentence: what they get, what it costs, why now. No paragraphs.",
        minutes: 25,
        skill: "Offer design",
        mentor: "Confused people don't buy. They just say they'll think about it.",
        produces: "A written offer.",
        district: "vault",
      },
      {
        id: "ask",
        title: "Make the ask",
        task: "Send the offer to ten people. Move each opportunity to the right stage as replies come in.",
        minutes: 40,
        skill: "Outreach",
        mentor: "The ask is the whole job. Everything before it is preparation.",
        produces: "Ten sent asks with tracked outcomes.",
        district: "opportunity",
      },
      {
        id: "listen",
        title: "Listen to the no",
        task: "For every no, log the reason. Patterns beat opinions.",
        minutes: 20,
        skill: "Feedback analysis",
        mentor: "Ten nos with reasons is worth more than one yes with none.",
        produces: "A written objection list.",
        district: "vault",
      },
      {
        id: "repeat",
        title: "Ask again, better",
        task: "Change the offer based on what you heard, then send to the next ten.",
        minutes: 40,
        skill: "Iteration",
        mentor: "Version two is where marketing actually starts.",
        produces: "A revised offer and a second round sent.",
        district: "opportunity",
      },
    ],
  },
  {
    id: "nonprofit",
    name: "Nonprofit Leader Path",
    identity: "You are building something that serves before it earns.",
    college: "College of Service",
    summary:
      "Turn care into a program people can join, fund and measure — without burning the people who run it.",
    outcome: "A written program, a first pilot, and a simple way to show what changed.",
    signals: ["nonprofit", "community", "charity", "foundation", "give", "impact", "service", "youth"],
    lessons: [
      {
        id: "need",
        title: "Name the real need",
        task: "Talk to three people the work is for. Write down what they actually asked for, in their words.",
        minutes: 45,
        skill: "Listening",
        mentor: "Serving people you never asked is just guessing with good intentions.",
        produces: "Three interview notes in your Vault.",
        district: "vault",
      },
      {
        id: "program",
        title: "Design one small program",
        task: "Write it on one page: who, what, how often, who runs it, what it costs.",
        minutes: 40,
        skill: "Program design",
        mentor: "Small and real beats big and imagined. Start with the version you can run this month.",
        produces: "A one-page program document.",
        district: "vault",
      },
      {
        id: "pilot",
        title: "Run the pilot",
        task: "Run it once with a handful of people. Write what worked and what broke the same day.",
        minutes: 60,
        skill: "Delivery",
        mentor: "The pilot exists to find the problems while they're still cheap.",
        produces: "A completed pilot and a debrief note.",
        district: "vault",
      },
      {
        id: "measure",
        title: "Measure what changed",
        task: "Pick two numbers that prove it mattered. Record the before and after.",
        minutes: 30,
        skill: "Impact measurement",
        mentor: "Funders fund what you can show. So do volunteers.",
        produces: "A simple impact record.",
        district: "opportunity",
      },
      {
        id: "fund",
        title: "Ask for the support",
        task: "Write the ask and send it to five people or organisations. Track each as an opportunity.",
        minutes: 40,
        skill: "Fundraising",
        mentor: "People give to a story with a number in it. Bring both.",
        produces: "Five tracked funding asks.",
        district: "opportunity",
      },
    ],
  },
  {
    id: "leadership",
    name: "Leadership Path",
    identity: "You are building a thing that can run without you in the room.",
    college: "College of Stewardship",
    summary:
      "Protect the Builder, write the rhythm down, and hand off the first piece of work you've been hoarding.",
    outcome: "A weekly rhythm you can keep and one responsibility handed to someone else.",
    signals: ["team", "lead", "leadership", "manage", "hire", "burnout", "overwhelmed", "scale"],
    lessons: [
      {
        id: "audit",
        title: "Audit your week",
        task: "Write what you actually did for seven days. Not what you planned.",
        minutes: 25,
        skill: "Self-awareness",
        mentor: "You can't lead a week you've never looked at honestly.",
        produces: "A written week audit.",
        district: "vault",
      },
      {
        id: "cut",
        title: "Cut one thing",
        task: "Find the task that costs the most and returns the least. Stop doing it this week.",
        minutes: 15,
        skill: "Prioritisation",
        mentor: "Every yes you keep is a no to something better. Reclaim one.",
        produces: "A recorded decision to stop something.",
        district: "vault",
      },
      {
        id: "rhythm",
        title: "Set the rhythm",
        task: "Pick your making day, your selling day, and your rest day. Write them down and keep them.",
        minutes: 20,
        skill: "Operating rhythm",
        mentor: "Rest isn't a reward for finishing. It's part of how the work stays good.",
        produces: "A written weekly rhythm.",
        district: "vault",
      },
      {
        id: "document",
        title: "Write one workflow down",
        task: "Take a task only you know how to do and write the steps so someone else could follow them.",
        minutes: 35,
        skill: "Documentation",
        mentor: "Knowledge in one head is a risk. Knowledge on a page is a company.",
        produces: "A documented workflow.",
        district: "vault",
      },
      {
        id: "handoff",
        title: "Hand it off",
        task: "Give that workflow to one person and let them run it their way once.",
        minutes: 30,
        skill: "Delegation",
        mentor: "They'll do it 80% your way. That 80% is what buys you the future.",
        produces: "A responsibility transferred.",
      },
      {
        id: "keep",
        title: "Keep it two weeks",
        task: "Run the rhythm for two weeks and note what broke. Adjust once — not five times.",
        minutes: 20,
        skill: "Consistency",
        mentor: "A system you adjust weekly isn't a system. Give it time to tell you the truth.",
        produces: "A tested rhythm with notes.",
        district: "vault",
      },
    ],
  },
];

export function pathById(id: string) {
  return BUILDER_PATHS.find((p) => p.id === id);
}

export function pathMinutes(path: BuilderPath) {
  return path.lessons.reduce((s, l) => s + l.minutes, 0);
}

export function lessonById(pathId: string, lessonId: string) {
  return pathById(pathId)?.lessons.find((l) => l.id === lessonId);
}

/**
 * Frassy's recommendation. Scores every path against what the Builder told us
 * during onboarding (memory values, stage, stated preferences).
 */
export function recommendPaths(signalText: string, startedPathIds: string[] = []) {
  const haystack = signalText.toLowerCase();
  const scored = BUILDER_PATHS.map((path) => {
    let score = 0;
    for (const signal of path.signals) {
      if (haystack.includes(signal)) score += 2;
    }
    if (startedPathIds.includes(path.id)) score -= 5;
    return { path, score };
  }).sort((a, b) => b.score - a.score);
  return scored;
}
