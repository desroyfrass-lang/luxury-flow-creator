// Academy District curriculum — Builder Paths, project-based and plain-English.
// Client-safe: no server imports.

export type Lesson = {
  id: string;
  title: string;
  /** What the Builder actually does — a real task, not a video. */
  task: string;
  minutes: number;
};

export type BuilderPath = {
  id: string;
  name: string;
  college: string;
  summary: string;
  outcome: string;
  lessons: Lesson[];
};

export const COLLEGES = [
  "College of Craft",
  "College of Commerce",
  "College of Voice",
  "College of Stewardship",
] as const;

export const BUILDER_PATHS: BuilderPath[] = [
  {
    id: "first-drop",
    name: "Ship Your First Drop",
    college: "College of Craft",
    summary: "Take one idea from a note to a real drop people can buy.",
    outcome: "A published product, priced, photographed, and attached to a dated drop.",
    lessons: [
      { id: "pick", title: "Pick the one idea", task: "Write down three ideas, then cross out two. Keep the one you'd still want to make next month.", minutes: 15 },
      { id: "spec", title: "Write the spec", task: "In the Creation District, add the product with a name, a short description, and three tags.", minutes: 20 },
      { id: "price", title: "Price it honestly", task: "Add up what it costs you to make and deliver one. Set a price that leaves you real profit.", minutes: 25 },
      { id: "image", title: "Get one good image", task: "Shoot or source one clean image and attach it to the product.", minutes: 30 },
      { id: "drop", title: "Set the drop date", task: "Create a drop in the Creation District, pick a date, and attach the product to it.", minutes: 15 },
      { id: "tell", title: "Tell three people", task: "Send the drop to three people who would actually buy it. Log their replies in your Vault.", minutes: 20 },
    ],
  },
  {
    id: "money-basics",
    name: "Know Your Numbers",
    college: "College of Commerce",
    summary: "Stop guessing. Learn exactly what comes in, what goes out, and what's left.",
    outcome: "A working ledger and a clear break-even number you can say out loud.",
    lessons: [
      { id: "log", title: "Log one month", task: "In the Opportunity Center, log every sale and expense from the last 30 days.", minutes: 40 },
      { id: "cost", title: "Find your true cost", task: "For one product, write down materials, production, shipping, and fees. That's your unit cost.", minutes: 25 },
      { id: "margin", title: "Check your margin", task: "Price minus unit cost. If it's under 40%, decide what to change.", minutes: 20 },
      { id: "breakeven", title: "Find break-even", task: "Divide your monthly costs by your profit per unit. That's how many you must sell.", minutes: 20 },
      { id: "goal", title: "Set the monthly goal", task: "Write the number in your Vault and add it as an opportunity target.", minutes: 15 },
    ],
  },
  {
    id: "brand-voice",
    name: "Find Your Voice",
    college: "College of Voice",
    summary: "Say what you're about in a way only you could say it.",
    outcome: "A written brand voice you can hand to anyone writing on your behalf.",
    lessons: [
      { id: "why", title: "Write the why", task: "Three sentences: who you make for, what you make, why it matters to you.", minutes: 20 },
      { id: "words", title: "Choose your words", task: "List ten words you'd use and five you never would. Keep it in your Vault.", minutes: 20 },
      { id: "story", title: "Tell one true story", task: "Write 150 words about a real moment behind the brand.", minutes: 30 },
      { id: "apply", title: "Apply it", task: "Rewrite one product description in your own voice.", minutes: 20 },
    ],
  },
  {
    id: "first-customers",
    name: "Win Your First Ten Customers",
    college: "College of Commerce",
    summary: "Go from nobody knows you to ten people who bought and would buy again.",
    outcome: "Ten real customers and a written note on why each one said yes.",
    lessons: [
      { id: "who", title: "Name who it's for", task: "Describe one specific person who needs what you make. Not 'everyone'.", minutes: 20 },
      { id: "list", title: "Build the list", task: "Write down 25 people or places that fit. Add them as opportunities.", minutes: 40 },
      { id: "ask", title: "Make the ask", task: "Message ten of them with one clear offer. No paragraphs.", minutes: 40 },
      { id: "listen", title: "Listen to the no", task: "For every no, log the reason in your Vault. Patterns beat opinions.", minutes: 20 },
      { id: "repeat", title: "Ask again, better", task: "Change the offer based on what you heard, then message the next ten.", minutes: 40 },
    ],
  },
  {
    id: "steady-hands",
    name: "Build Without Burning Out",
    college: "College of Stewardship",
    summary: "Protect the Builder so the building can last.",
    outcome: "A weekly rhythm you can actually keep, written down.",
    lessons: [
      { id: "audit", title: "Audit your week", task: "Write what you actually did for seven days. Not what you planned.", minutes: 25 },
      { id: "cut", title: "Cut one thing", task: "Find the task that costs the most and returns the least. Stop doing it.", minutes: 15 },
      { id: "rhythm", title: "Set the rhythm", task: "Pick your making day, your selling day, and your rest day. Write them down.", minutes: 20 },
      { id: "keep", title: "Keep it two weeks", task: "Run the rhythm for two weeks and note what broke.", minutes: 20 },
    ],
  },
];

export function pathById(id: string) {
  return BUILDER_PATHS.find((p) => p.id === id);
}

export function pathMinutes(path: BuilderPath) {
  return path.lessons.reduce((s, l) => s + l.minutes, 0);
}
