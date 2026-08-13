// FRASS-0555 — AI Provider Independence.
//
// Frass is never married to one AI company. Every intelligence capability
// (conversation, vision, speech-out, speech-in, embedding) is described here
// as a *capability* with an ordered list of providers. Application code asks
// for a capability, never for a vendor. Swapping a provider is a one-line
// change in this file — nothing else in the platform moves.
//
// Plain English: this is the socket. The AI companies are the plugs.

export type AiCapability =
  | "conversation"
  | "reasoning"
  | "vision"
  | "speech-out"
  | "speech-in";

export type AiProviderOption = {
  /** Gateway model id. */
  model: string;
  /** Vendor family, for telemetry and independence reporting. */
  vendor: "google" | "openai" | "other";
  /** Relative cost band, used by the Founder dashboard, not by billing. */
  cost: "low" | "medium" | "high";
  why: string;
};

export type AiCapabilitySpec = {
  capability: AiCapability;
  label: string;
  plain: string;
  endpoint: string;
  /** Ordered: first choice, then fallbacks. */
  chain: AiProviderOption[];
};

export const AI_PROVIDERS: Record<AiCapability, AiCapabilitySpec> = {
  conversation: {
    capability: "conversation",
    label: "Conversation",
    plain: "Everyday talking with Frassy.",
    endpoint: "/v1/chat/completions",
    chain: [
      { model: "google/gemini-3.6-flash", vendor: "google", cost: "low", why: "Fast and cheapest for ordinary talk." },
      { model: "google/gemini-2.5-flash", vendor: "google", cost: "low", why: "Same family, used if the first is busy." },
      { model: "openai/gpt-5-mini", vendor: "openai", cost: "medium", why: "Different company entirely — independence backup." },
    ],
  },
  reasoning: {
    capability: "reasoning",
    label: "Deep reasoning",
    plain: "Planning, money maths, long analysis.",
    endpoint: "/v1/chat/completions",
    chain: [
      { model: "google/gemini-3-pro-preview", vendor: "google", cost: "high", why: "Best judgement for heavy thinking." },
      { model: "google/gemini-3.6-flash", vendor: "google", cost: "low", why: "Cheaper stand-in when the pro brain is unavailable." },
    ],
  },
  vision: {
    capability: "vision",
    label: "Vision",
    plain: "Looking at photos, designs and sketches.",
    endpoint: "/v1/chat/completions",
    chain: [
      { model: "google/gemini-3.6-flash", vendor: "google", cost: "low", why: "Sees images at conversation prices." },
      { model: "openai/gpt-5-mini", vendor: "openai", cost: "medium", why: "Second pair of eyes from another company." },
    ],
  },
  "speech-out": {
    capability: "speech-out",
    label: "Frassy's voice",
    plain: "Turning Frassy's words into speech.",
    endpoint: "/v1/audio/speech",
    chain: [
      { model: "openai/gpt-4o-mini-tts", vendor: "openai", cost: "medium", why: "Carries Frassy's official voice identity." },
    ],
  },
  "speech-in": {
    capability: "speech-in",
    label: "Listening",
    plain: "Turning what a member says into text.",
    endpoint: "/v1/audio/transcriptions",
    chain: [
      { model: "openai/gpt-4o-transcribe", vendor: "openai", cost: "medium", why: "Handles Caribbean accents accurately." },
    ],
  },
};

/** The ordered model chain for a capability. Application code calls this. */
export function providerChain(capability: AiCapability): string[] {
  return AI_PROVIDERS[capability].chain.map((p) => p.model);
}

/** The first-choice model for a capability. */
export function primaryProvider(capability: AiCapability): string {
  return AI_PROVIDERS[capability].chain[0].model;
}

/** Founder-readable independence summary. */
export const PROVIDER_INDEPENDENCE_SUMMARY = [
  "Every AI capability in Frass names a first choice and at least one backup.",
  "Conversation, reasoning and vision can already fall back to a different AI company.",
  "Voice in and voice out are single-supplier today — that is the one dependency worth watching.",
];
