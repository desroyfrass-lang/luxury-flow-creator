// FRASS-0601 — server-only brains of the Frassy Studios Production Engine.
//
// Nothing in this file may reach the browser. It holds the Founder check, the
// structured-memory context builder, and the single place Frassy's writing
// engine is called from. Provider credentials never leave the server.

import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { ageDirectiveFor } from "@/lib/studios/age-rules";

type Db = { from: (t: string) => any; rpc: (n: string, a: unknown) => any };

const MODEL_CHAIN = ["google/gemini-3.5-flash", "google/gemini-3-flash"];

export class StudioEngineError extends Error {
  constructor(
    message: string,
    public readonly kind: "auth" | "credits" | "blocked" | "busy" | "provider" | "input" = "provider",
  ) {
    super(message);
  }
}

/** Zero Trust: the Founder check happens here, on the server, every single call. */
export async function requireStudioStaff(sb: Db, userId: string): Promise<void> {
  const [admin, superAdmin] = await Promise.all([
    sb.rpc("has_role", { _user_id: userId, _role: "admin" }),
    sb.rpc("has_role", { _user_id: userId, _role: "super_admin" }),
  ]);
  if (!admin?.data && !superAdmin?.data) {
    throw new StudioEngineError("Frassy Studios is Founder and Admin only.", "auth");
  }
}

/** Frassy's studio voice — Caribbean warmth, production-house discipline. */
const STUDIO_VOICE = `You are Frassy, the production intelligence of Frassy Studios inside Frass Hill.

Who you are:
- Caribbean warmth, calm confidence, no corporate software voice.
- You are the Founder's producer and story editor. You develop the work; the Founder decides.
- Plain English always. If you must use a craft term, explain it in the same breath.

Permanent naming law — never break it:
- The ecosystem is FRASS. Frass Kicks, Frass Hill, Frass Chronicles, Frassy Street, Frassy Studios, Frassy.
- NEVER change FRASS to Frost, Frosty, Fresh or Fras. It is not a typo. Preserve it exactly.

Canon law:
- The Series Bible is the truth. You never quietly invent a canon change.
- If the story needs something the Bible does not allow, you say so plainly and propose it as a canon change for Founder approval.
- Reuse approved characters, locations, voices and animations. Do not reinvent a recurring character.

Honesty law:
- Never claim media was generated. You write and you plan; media generation happens through connected services only.
- Never invent costs, view counts or earnings.`;

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json/gi, "```").split("```").join("\n").trim();
  const candidates = [cleaned, text];
  for (const c of candidates) {
    const start = Math.min(
      ...[c.indexOf("{"), c.indexOf("[")].filter((n) => n >= 0).concat([Number.MAX_SAFE_INTEGER]),
    );
    if (start === Number.MAX_SAFE_INTEGER) continue;
    const end = Math.max(c.lastIndexOf("}"), c.lastIndexOf("]"));
    if (end <= start) continue;
    try {
      return JSON.parse(c.slice(start, end + 1));
    } catch {
      /* try next */
    }
  }
  throw new StudioEngineError("Frassy answered, but not in the shape the studio expected. Try again.", "provider");
}

function mapGatewayError(err: unknown): StudioEngineError {
  const status =
    (err as { statusCode?: number; status?: number })?.statusCode ??
    (err as { status?: number })?.status ??
    0;
  const message = err instanceof Error ? err.message : String(err);
  if (status === 402 || /402/.test(message))
    return new StudioEngineError(
      "The workspace is out of AI credits, so Frassy can't write right now. Top up credits in Lovable and try again.",
      "credits",
    );
  if (status === 403 || /403/.test(message))
    return new StudioEngineError(
      "AI writing is switched off for this workspace, or a spending limit was reached. An admin has to lift it before Frassy can write.",
      "blocked",
    );
  if (status === 429 || /429/.test(message))
    return new StudioEngineError("Frassy is being rate limited. Give it a moment and ask again.", "busy");
  if (status === 401 || /401/.test(message))
    return new StudioEngineError("Frassy's writing engine isn't configured on the server.", "provider");
  return new StudioEngineError(`Frassy couldn't finish that: ${message}`, "provider");
}

/** The one door to Frassy's writing engine. Always returns parsed JSON. */
export async function frassyJson<T>(instruction: string, payload: string): Promise<{ data: T; model: string }> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new StudioEngineError("Frassy's writing engine isn't configured on the server.", "provider");
  const gateway = createLovableAiGatewayProvider(key);

  const system = `${STUDIO_VOICE}

${instruction}

Answer with valid JSON only. No commentary before or after. No code fences.`;

  let lastError: unknown = null;
  for (const modelId of MODEL_CHAIN) {
    try {
      const result = await generateText({ model: gateway(modelId), system, prompt: payload });
      return { data: extractJson(result.text) as T, model: modelId };
    } catch (err) {
      lastError = err;
      const mapped = mapGatewayError(err);
      // Credit and policy failures are terminal — never try the next model.
      if (mapped.kind === "credits" || mapped.kind === "blocked") throw mapped;
    }
  }
  throw mapGatewayError(lastError);
}

// ---------------------------------------------------------------------------
// PRODUCTION MEMORY — retrieve only what this production needs.
// Never one enormous prompt containing the whole Frass universe.
// ---------------------------------------------------------------------------

export type ProductionContext = {
  production: Record<string, any> | null;
  series: Record<string, any> | null;
  bible: Record<string, any> | null;
  characters: Array<Record<string, any>>;
  locations: Array<Record<string, any>>;
  voices: Array<Record<string, any>>;
  previousEpisodes: Array<{ episode_number: number | null; title: string; concept: string | null }>;
  brief: Record<string, any> | null;
  development: Record<string, any> | null;
  script: Record<string, any> | null;
  scenes: Array<Record<string, any>>;
  memory: Array<{ key: string; value: string }>;
};

export async function loadProductionContext(sb: Db, productionId: string): Promise<ProductionContext> {
  const { data: production } = await sb
    .from("studio_productions")
    .select("*, studio_series(*)")
    .eq("id", productionId)
    .maybeSingle();
  if (!production) throw new StudioEngineError("That production no longer exists.", "input");

  const seriesId = production.series_id as string | null;

  const [bible, characters, locations, voices, prev, brief, development, script, scenes, memory] = await Promise.all([
    seriesId
      ? sb.from("studio_series_bibles").select("*").eq("series_id", seriesId).maybeSingle()
      : Promise.resolve({ data: null }),
    seriesId
      ? sb.from("studio_characters").select("*").or(`series_id.eq.${seriesId},series_id.is.null`).order("name")
      : sb.from("studio_characters").select("*").order("name"),
    seriesId
      ? sb.from("studio_locations").select("*").or(`series_id.eq.${seriesId},series_id.is.null`).order("name")
      : sb.from("studio_locations").select("*").order("name"),
    sb.from("studio_voices").select("*").eq("active", true).order("name"),
    seriesId
      ? sb
          .from("studio_productions")
          .select("episode_number, title, concept")
          .eq("series_id", seriesId)
          .neq("id", productionId)
          .order("episode_number", { ascending: true })
          .limit(30)
      : Promise.resolve({ data: [] }),
    sb.from("studio_briefs").select("*").eq("production_id", productionId).maybeSingle(),
    sb
      .from("studio_episode_development")
      .select("*")
      .eq("production_id", productionId)
      .eq("is_current", true)
      .maybeSingle(),
    sb.from("studio_scripts").select("*").eq("production_id", productionId).maybeSingle(),
    sb.from("studio_scenes").select("*").eq("production_id", productionId).order("scene_number"),
    seriesId
      ? sb
          .from("studio_production_memory")
          .select("key, value")
          .or(`series_id.eq.${seriesId},production_id.eq.${productionId}`)
          .order("importance", { ascending: false })
          .limit(40)
      : Promise.resolve({ data: [] }),
  ]);

  return {
    production,
    series: production.studio_series ?? null,
    bible: bible?.data ?? null,
    characters: characters?.data ?? [],
    locations: locations?.data ?? [],
    voices: voices?.data ?? [],
    previousEpisodes: prev?.data ?? [],
    brief: brief?.data ?? null,
    development: development?.data ?? null,
    script: script?.data ?? null,
    scenes: scenes?.data ?? [],
    memory: memory?.data ?? [],
  };
}

const trim = (v: unknown, max = 900) => (typeof v === "string" && v.length > max ? `${v.slice(0, max)}…` : v ?? "");

/** The structured block handed to Frassy. Only the relevant slice, never everything. */
export function renderContext(ctx: ProductionContext, opts: { includeScript?: boolean; includeScenes?: boolean } = {}) {
  const p = ctx.production ?? {};
  const b = ctx.bible ?? {};
  const lines: string[] = [];

  lines.push("=== PRODUCTION ===");
  lines.push(
    JSON.stringify(
      {
        title: p.title,
        type: p.production_type,
        series: ctx.series?.name ?? null,
        season: p.season,
        episode: p.episode_number,
        audience: p.audience,
        age_group: p.age_group,
        target_duration_seconds: p.target_duration_seconds,
        destinations: p.destinations,
        aspect_ratio: p.aspect_ratio,
        concept: trim(p.concept),
        story_goal: trim(p.story_goal),
        educational_objective: trim(p.educational_objective),
        visual_style: trim(p.visual_style, 300),
        music_direction: trim(p.music_direction, 300),
        special_instructions: trim(p.special_instructions, 400),
      },
      null,
      1,
    ),
  );

  lines.push("\n=== SERIES BIBLE (canon — do not contradict) ===");
  lines.push(
    ctx.bible
      ? JSON.stringify(
          {
            series_description: trim(ctx.series?.description),
            world_rules: trim(b.world_rules),
            story_rules: trim(b.story_rules),
            visual_style: trim(b.visual_style),
            language_style: trim(b.language_style),
            character_relationships: trim(b.character_relationships),
            canon_events: trim(b.canon_events),
            timeline: trim(b.timeline),
            locations: trim(b.locations),
            recurring_objects: trim(b.recurring_objects),
            unresolved_storylines: trim(b.unresolved_storylines),
            educational_standards: trim(b.educational_standards),
            forbidden_changes: trim(b.forbidden_changes),
          },
          null,
          1,
        )
      : "No Series Bible recorded yet. Do not invent canon — propose it instead.",
  );

  if (ctx.characters.length) {
    lines.push("\n=== APPROVED CHARACTER LIBRARY (reuse these identities exactly) ===");
    lines.push(
      JSON.stringify(
        ctx.characters.slice(0, 30).map((c) => ({
          name: c.name,
          role: c.role,
          approved: c.approved,
          appearance: trim(c.appearance, 260),
          personality: trim(c.personality, 200),
          speech_style: trim(c.speech_style, 200),
          voice: c.voice,
          wardrobe: trim(c.wardrobe, 200),
        })),
        null,
        1,
      ),
    );
  }

  if (ctx.locations.length) {
    lines.push("\n=== EXISTING LOCATIONS (reuse before proposing new) ===");
    lines.push(JSON.stringify(ctx.locations.slice(0, 30).map((l) => ({ name: l.name, description: trim(l.description, 200) })), null, 1));
  }

  if (ctx.voices.length) {
    lines.push("\n=== VOICE LIBRARY ===");
    lines.push(
      JSON.stringify(
        ctx.voices.slice(0, 30).map((v) => ({ name: v.name, accent: v.accent, tone: v.tone, age: v.age_presentation })),
        null,
        1,
      ),
    );
  }

  if (ctx.previousEpisodes.length) {
    lines.push("\n=== PREVIOUS EPISODES (continuity) ===");
    lines.push(
      JSON.stringify(
        ctx.previousEpisodes.map((e) => ({ episode: e.episode_number, title: e.title, concept: trim(e.concept, 180) })),
        null,
        1,
      ),
    );
  }

  if (ctx.memory.length) {
    lines.push("\n=== PRODUCTION MEMORY ===");
    lines.push(ctx.memory.map((m) => `- ${m.key}: ${m.value}`).join("\n"));
  }

  if (ctx.development) {
    lines.push("\n=== EPISODE DEVELOPMENT ===");
    lines.push(
      JSON.stringify(
        {
          concept: trim(ctx.development.concept),
          synopsis: trim(ctx.development.synopsis, 1600),
          story_beats: ctx.development.story_beats,
          character_roles: ctx.development.character_roles,
          locations: ctx.development.locations,
          educational_objective: trim(ctx.development.educational_objective),
        },
        null,
        1,
      ),
    );
  }

  if (opts.includeScript && ctx.script?.body) {
    lines.push("\n=== CURRENT SCRIPT ===");
    lines.push(String(ctx.script.body).slice(0, 14000));
  }

  if (opts.includeScenes && ctx.scenes.length) {
    lines.push("\n=== SCENES ===");
    lines.push(
      JSON.stringify(
        ctx.scenes.map((s) => ({
          number: s.scene_number,
          title: s.title,
          location: s.location,
          characters: s.characters,
          dialogue: trim(s.dialogue, 500),
          narration: trim(s.narration, 300),
          action: trim(s.script, 400),
        })),
        null,
        1,
      ),
    );
  }

  lines.push("\n=== AGE RULES (binding) ===");
  lines.push(ageDirectiveFor(p.age_group));

  return lines.join("\n");
}
