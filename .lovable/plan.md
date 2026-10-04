# Animation Engine Forensic Audit — Result (read-only, nothing changed)

## Verdict: C. SCAFFOLDED / PLANNED ONLY — confidence high (about 90%)

The Founder's memory is correct that real animation-related work was done. That work built the **sockets and the stage** for an animation engine. It never built the **machine** that makes movement. No hidden, renamed, deleted or disconnected generator exists to reconnect.

## What was built, and when

| Date | Work | What it really is |
|---|---|---|
| 2026-08-25 | "Added cinematic breathing motion" (front door) | Styling motion on the front-door symbols. Not a generator. |
| Late Aug–Sep | FV Studios Generation Router (`src/lib/studios/generation-layer.ts`), production engine (13 server functions) | Writes scripts and scene plans, including an "[ANIMATION]" direction line per scene. That is text only. |
| Sep | Commissioning pass 1 (`src/lib/studios/native-engines.ts`) | A list of nine machine slots: image, video, **animation**, voice, music, sound, audio repair, finishing, writing. The file itself says: "nothing in this file performs generation." |
| Sep | A1 Clean (`frass_a1_clean_web_audio_v1`) | The **only** Frass-built media machine. It repairs audio, not animation. |
| 2026-09-20 | "State-driven / non-collapsing motion slot" (`src/lib/frassy/room-looks.ts`, `frassy-chat.tsx`, `styles.css`) | A ready-made socket for Frassy's states: idle, listening, thinking, speaking, gesturing, working. Every state still shows the one approved seated picture. The pass reported plainly: "No body distortion or fake lip-sync." |

## Evidence checked

- **Code:** no animation or video libraries are installed (no Lottie, Rive, Remotion, Three, Pixi, GSAP or ffmpeg). No sprite, rig, mouth-shape, lip-sync or frame-rendering code exists. The only drawing surface is the Gallery drawing pad.
- **Git:** 4,214 commits searched. No deleted or renamed file names an animator, rig, sprite or lip-sync. The only "motion" commits are the three listed above.
- **Chat history:** the earlier wishes were "a subtle blink, a tiny breathing animation" and "a future Frassy motion layer." Later Founder direction (around chat line 215544) said full lip-sync and animation are "later commissioning." No message asks for, or completes, an actual animation engine.
- **Database:**
  - `animation_provider_slot`: not configured and switched off.
  - `studio_animations`: 0 rows.
  - `studio_generation_jobs`: 1 job, waiting for a machine, never charged.
  - No completed animation jobs. No animation or video output files.
- **File storage:** nine private storage areas. None is for animation; `studio-audio` belongs to A1 Clean.

## Where the Studio's Animation path stops today

```text
Animation choice -> Frassy plans it (REAL) -> job request (REAL)
  -> routeToEngine("animation") -> NOT INSTALLED (stops here, honestly)
  -> [missing] engine that makes the motion
  -> [missing] check that the file really plays
  -> save to Assets + charge credits (REAL logic, already used by A1 Clean)
```

## What works today, what is waiting, what is only a frame

- **Works today:** Studio screens, Frassy as director, scripts and scene plans, cost estimate, credit wallet, job queue, the "no charge without a checked result" rule, the A1 Clean pattern, the Frassy state socket, and Studio presence motion (gentle drift and light).
- **Waiting (ready, no machine behind it):** the animation slot, the Animation Library table, and the Frassy state list. All of them fall back to one picture.
- **Frame only:** scene "animation notes", which are words, not movement.

## Can anything be reconnected instead of rebuilt?

There is no engine to reconnect. What **can** be reused without rebuilding:

1. the slot and routing rules
2. the job queue and the check-before-charge rule (copy the A1 Clean pattern)
3. the Frassy state socket, which a motion rig can plug straight into
4. the Animation Library table, to register finished movements

## Missing pieces, in order

1. A real animation machine. Your choice from last time: the Frass motion rig (option 2) or an outside service (option 1).
2. Register it as a Frass-owned machine and switch it on.
3. A step that checks each result is a real, playable file.
4. Save results to Assets and the Animation Library.
5. Connect approved results to the Frassy states on the site.

## Safest next action (not done)

Approve **option 2: a Frass-owned motion rig**, built the A1 Clean way. Prove it first with a disposable test movement. Do not touch the live Frassy picture. Founder review comes before anything goes on the site.

## Technical notes

- Key files: `src/lib/studios/native-engines.ts`, `src/lib/studios/generation-layer.ts`, `src/lib/studios/production-engine.functions.ts`, `src/lib/studio.functions.ts`, `src/lib/studio/engine-truth.test.ts`, `src/lib/frassy/room-looks.ts`, `src/components/frassy-chat.tsx`.
- Commits: `fcfcb117`, `56de9c9e`, `061b538f`.
- Database tables: `studio_providers`, `studio_generation_jobs`, `studio_animations`, `studio_assets`.
- Changes made in this audit: none. Publish/Deploy: NO.
