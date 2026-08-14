// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0463 — The First Partner Journal + The First Week Promise.
// Private by default. Nothing reaches the Founder unless the Partner shares it.
// ─────────────────────────────────────────────────────────────────────────────

export type JournalEntry = {
  id: string;
  entry_date: string;
  prompt: string;
  body: string;
  mood: string | null;
  shared: boolean;
  created_at: string;
};

export const JOURNAL_MOODS = ["Clear", "Steady", "Stretched", "Stuck", "Proud"] as const;

/** One question a night — rotating, never a form. */
export const JOURNAL_PROMPTS = [
  "What did you actually get done today, in your own words?",
  "Was anything confusing today? Say it plainly — nothing is too small.",
  "What made you feel like this is really your business?",
  "Which of your five businesses pulled at you most today, and why?",
  "What would have made today easier?",
  "What are you avoiding? No judgement — naming it is the work.",
  "What is one thing you want to be true by this time next week?",
];

export function journalPromptFor(date: string): string {
  const day = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
  const idx = ((day % JOURNAL_PROMPTS.length) + JOURNAL_PROMPTS.length) % JOURNAL_PROMPTS.length;
  return JOURNAL_PROMPTS[idx] ?? JOURNAL_PROMPTS[0]!;
}

export function journalToday(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── The First Week Promise ──────────────────────────────────────────────────
// Seven days, seven things that must simply make sense. Not features — feelings
// of clarity. If a day's promise isn't true, that is the work for the day.

export type WeekPromise = { day: number; promise: string; plain: string };

export const FIRST_WEEK_PROMISE: WeekPromise[] = [
  { day: 1, promise: "You know exactly where you are and what Frass is for.", plain: "Day one is orientation, not output. If the map makes sense, day one worked." },
  { day: 2, promise: "Your Frass Card is real and shareable.", plain: "One link that is you: who you are, what you sell, how people reach you." },
  { day: 3, promise: "Your businesses are set up, not just imagined.", plain: "Each one has a home inside Frass instead of living in your head." },
  { day: 4, promise: "You published something real.", plain: "A post, a listing, a page — something a stranger could actually see." },
  { day: 5, promise: "You know what today's highest value work is, without asking.", plain: "Money Moves tells you the one thing most likely to earn, and why." },
  { day: 6, promise: "You know how money will reach you at launch.", plain: "Wallet, receipts and the 90/10 split explained in practical terms." },
  { day: 7, promise: "You can say: this just made sense.", plain: "Seven days in, the system should feel obvious — that is the whole promise." },
];

export function promiseForDay(day: number): WeekPromise | null {
  return FIRST_WEEK_PROMISE.find((p) => p.day === day) ?? null;
}

export function weekPromiseKept(day: number, keptIds: number[]): number {
  const upto = Math.min(Math.max(day, 1), 7);
  const kept = keptIds.filter((d) => d <= upto).length;
  return Math.round((kept / upto) * 100);
}
