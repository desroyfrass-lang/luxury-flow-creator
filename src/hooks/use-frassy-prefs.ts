import { useEffect, useState } from "react";

export type FrassyVoice = "feminine" | "masculine" | "neutral";
export type FrassyLanguage = "english" | "caribbean-lite" | "caribbean" | "patois";
export type FrassyGreetingStyle = "quiet" | "friendly" | "concierge";
export type FrassyAnimation = "minimal" | "standard" | "expressive";
export type FrassyCommunicationMode = "silent" | "voice_text" | "voice_only";
export type FrassyVoiceProfile =
  | "calm-luxury"
  | "warm-friendly"
  | "happy-joyful"
  | "professional-concierge"
  | "confident-advisor";

export type FrassyPrefs = {
  communicationMode: FrassyCommunicationMode;
  voice: FrassyVoice;
  voiceProfile: FrassyVoiceProfile;
  language: FrassyLanguage;
  greetingStyle: FrassyGreetingStyle;
  animation: FrassyAnimation;
  muted: boolean;
  consentedAt: string | null;
  consentDismissCount: number;
  // Spec 032 — Customer Control
  disableProactive: boolean;
  disableHomepageGreeting: boolean;
};

const DEFAULTS: FrassyPrefs = {
  // Spec 031: default to Silent Concierge until the customer opts in.
  communicationMode: "silent",
  voice: "feminine",
  voiceProfile: "calm-luxury",
  language: "caribbean-lite",
  greetingStyle: "concierge",
  animation: "standard",
  muted: false,
  consentedAt: null,
  consentDismissCount: 0,
  disableProactive: false,
  disableHomepageGreeting: false,
};

const KEY = "frassy:prefs:v2";
const LEGACY_KEY = "frassy:prefs:v1";

function load(): FrassyPrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<FrassyPrefs>) };
    // Migrate v1 (no consent gate) into silent-until-consented v2.
    const legacy = window.localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as Partial<FrassyPrefs>;
      return { ...DEFAULTS, ...parsed, communicationMode: "silent", consentedAt: null };
    }
    return DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function useFrassyPrefs() {
  const [prefs, setPrefs] = useState<FrassyPrefs>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPrefs(load());
    setHydrated(true);
  }, []);

  const update = (patch: Partial<FrassyPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          /* noop */
        }
      }
      return next;
    });
  };

  return { prefs, update, hydrated };
}

// -------- Greeting library, keyed by language style --------

const GREETINGS: Record<FrassyLanguage, string[]> = {
  english: [
    "Welcome back. Ready to discover something new today?",
    "Nice to see you again. I picked out a few things you might like.",
    "Hello. Need help finding the perfect look?",
    "Good to see you. Want a tour of what just landed?",
  ],
  "caribbean-lite": [
    "Welcome back, love. Ready to find something special today?",
    "Good to see you again. I have a few pieces you'll want to see.",
    "Hello, darling. Let me know if you want me to style a look for you.",
    "You're in the right place. Want me to show you what's trending?",
  ],
  caribbean: [
    "Welcome back, mi dear. Ready to find something nice today?",
    "Good to see you again. Mi have some pieces you gonna love.",
    "Hello, sweetness. Want me to help you build a whole look?",
    "You back! Mek me show you what a run the place right now.",
  ],
  patois: [
    "Wah gwaan! Welcome back to di Hill.",
    "Bless up, mi dear — mi have some pieces fi show yuh.",
    "Yow, good fi see yuh again. Ready fi style up?",
    "Mi glad seh yuh reach. Mek mi help yuh find di perfect fit.",
  ],
};

export function pickGreeting(language: FrassyLanguage): string {
  const pool = GREETINGS[language] ?? GREETINGS.english;
  return pool[Math.floor(Math.random() * pool.length)];
}

// -------- Voice picker for SpeechSynthesis --------

const FEMININE_HINTS = ["female", "samantha", "victoria", "karen", "moira", "tessa", "zira", "susan", "allison", "ava", "serena"];
const MASCULINE_HINTS = ["male", "daniel", "alex", "fred", "tom", "george", "oliver", "rishi", "aaron"];

export function pickVoice(
  voice: FrassyVoice,
  language: FrassyLanguage,
): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const wantLang = language === "english" ? /en-(US|GB|CA|AU)/i : /en-(JM|TT|BB|GB|US)/i;
  const langMatches = voices.filter((v) => wantLang.test(v.lang));
  const pool = langMatches.length ? langMatches : voices.filter((v) => /^en/i.test(v.lang));
  if (!pool.length) return voices[0];

  const nameOf = (v: SpeechSynthesisVoice) => v.name.toLowerCase();
  const isFem = (v: SpeechSynthesisVoice) => FEMININE_HINTS.some((h) => nameOf(v).includes(h));
  const isMasc = (v: SpeechSynthesisVoice) => MASCULINE_HINTS.some((h) => nameOf(v).includes(h));

  if (voice === "feminine") return pool.find(isFem) ?? pool[0];
  if (voice === "masculine") return pool.find(isMasc) ?? pool[0];
  return pool.find((v) => !isFem(v) && !isMasc(v)) ?? pool[0];
}
