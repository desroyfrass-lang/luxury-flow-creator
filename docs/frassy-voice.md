# Frassy's Voice — one copy layer (FRASS-0583)

Every word a partner reads on screen is Frassy speaking. This is where those
words live.

## Where the words are

| File | What it is |
| --- | --- |
| `locales/frassy-en.json` | The voice pack. Nested keys, plain English source of truth. Edit this to change wording. |
| `src/lib/frassy/voice-copy.ts` | `t()`, `tForTier()`, `validateTokens()`, the rollout switch. |
| `src/lib/i18n.ts` | What components import. |
| `src/lib/frassy/personality.ts` | `FRASSY_HARD_RULES` — the same law applied to everything Frassy generates. |

## Using it in a component

```tsx
import { t, tForTier } from "@/lib/i18n";

<h1>{t("global.headerBuildingFor", { name })}</h1>
<p>{tForTier("hero.heroFrassyNote", "beginner", { moveName, name })}</p>
<button>{t("hero.heroButtonLaunch")}</button>
```

The third argument is the previous wording, kept as a fallback while the
rollout switch is off:

```tsx
t("queue.loading", undefined, "Opening your queue…")
```

## Placeholders

Only these tokens are allowed: `{name}`, `{moveName}`, `{tierLabel}`,
`{months}`, `{count}`, `{pct}`, `{styleName}`, `{outfitName}`, `{insight}`,
`{signal}`. Anything else fails the token test.

If `{name}` is unknown, pass an empty string — `t()` tidies the sentence so no
stray comma is left behind.

## Accessibility

Live updates (launch, rework, shelve, trouble) render inside an
`aria-live="polite"` region using the `ariaLiveAnnouncement.*` keys. The
"hear this" icon button is labelled with `accessibility.audioPlayTooltip`.

## Rules that are enforced

- `src/lib/frassy/voice-copy.test.ts` — every token is allowed, no empty
  placeholders, no banned wording inside the pack itself.
- `src/lib/frassy/copy-lint.test.ts` — scans partner-facing components and
  routes for banned generic wording. Founder-only Control Room, Founder and
  admin paths are allowlisted; those screens are allowed to be technical.

## Rollout and undo

The layer is on by default. To fall back to the previous wording instantly,
run `setVoiceCopyEnabled(false)` (stored in the browser as
`frass:voice-copy = off`). No redeploy needed.

## Changing copy

1. Edit `locales/frassy-en.json`.
2. Run the tests.
3. Publish.

Short-key minification (`frassy-en.min.json` + `frassy-en.map.json`) is
deliberately not built: it saves a few kilobytes and costs readable logs and
one-line hotfixes. Because every screen goes through `t()`, it can be switched
on later without touching a single component.
