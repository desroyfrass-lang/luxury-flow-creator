// FRASS-0583 — the loader components import.
//
// One line for every screen: `import { t } from "@/lib/i18n";`
// The copy pack is bundled at build time, so this works identically in the
// browser and during server rendering — no fetch, no per-request cost.

export {
  t,
  tForTier,
  validateTokens,
  allCopyKeys,
  voiceCopyEnabled,
  setVoiceCopyEnabled,
  ALLOWED_TOKENS,
  VOICE_COPY_FLAG,
  type Tier,
} from "@/lib/frassy/voice-copy";
