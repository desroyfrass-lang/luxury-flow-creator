// FRASS-0601 — Frassy Studios Production Engine: the server doors.
//
// Thin wrappers only. Every brain lives in production-engine.server.ts, which
// can never reach the browser. Every call re-checks Founder/Admin on the
// server — a route guard is comfort, this is the actual lock.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Db = { from: (t: string) => any; rpc: (n: string, a: unknown) => any };

/** Turn a plain sentence into a structured production the studio understands. */
export const interpretProductionRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { request: string }) => {
    const request = (input.request ?? "").trim();
    if (request.length < 6) throw new Error("Tell Frassy what you want made.");
    return { request: request.slice(0, 4000) };
  })
  .handler(async ({ data, context }) => {
    const { requireStudioStaff, frassyJson } = await import("@/lib/studios/production-engine.server");
    const sb = context.supabase as unknown as Db;
    await requireStudioStaff(sb, context.userId);

    const [{ data: series }, { data: characters }] = await Promise.all([
      sb.from("studio_series").select("id, name, slug, description, audience, age_group, tone").order("name"),
      sb.from("studio_characters").select("name, series_id").eq("approved", true).limit(60),
    ]);

    const { data: result, model } = await frassyJson<{
      series_slug: string | null;
      series_name: string | null;
      production_type: string;
      working_title: string;
      episode_number: number | null;
      season: number | null;
      audience: string;
      age_group: string;
      objective: string;
      story_concept: string;
      characters: string;
      locations: string;
      target_duration_seconds: number;
      target_platforms: string[];
      visual_direction: string;
      voice_direction: string;
      music_direction: string;
      educational_objective: string;
      special_instructions: string;
      derivative_of_existing: boolean;
      understanding: string;
      questions: string[];
    }>(
      `Read the Founder's request and turn it into a structured Production Brief.
Choose the matching series from the list when one clearly fits; otherwise return null for series.
production_type must be one of: full_episode, short_episode, youtube_video, youtube_short, reel, tiktok, trailer, teaser, promo, educational, music_video, commercial, social_clip, custom.
age_group must be one of: 0-3, 3-6, 6-12, 12-15, Teen, Adult, General Audience.
target_platforms uses: frass_hill, youtube, youtube_shorts, tiktok, instagram, facebook.
"understanding" is one warm sentence saying back what you understood.
"questions" holds at most three things you genuinely need the Founder to decide. Never invent canon — ask instead.
Return every field in the schema described.`,
      `FOUNDER REQUEST:\n${data.request}\n\nEXISTING SERIES:\n${JSON.stringify(series ?? [], null, 1)}\n\nAPPROVED CHARACTERS:\n${JSON.stringify((characters ?? []).map((c: any) => c.name), null, 1)}`,
    );

    const match = (series ?? []).find(
      (s: any) => s.slug === result.series_slug || s.name?.toLowerCase() === (result.series_name ?? "").toLowerCase(),
    );

    return { ...result, series_id: match?.id ?? null, model };
  });

/** Create (or re-create) the Production Brief for an existing production. */
export const saveBrief = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { productionId: string; brief: Record<string, unknown>; sourceRequest?: string }) => {
    if (!input.productionId) throw new Error("Which production?");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { requireStudioStaff } = await import("@/lib/studios/production-engine.server");
    const sb = context.supabase as unknown as Db;
    await requireStudioStaff(sb, context.userId);

    const { data: existing } = await sb
      .from("studio_briefs")
      .select("id, revision_count")
      .eq("production_id", data.productionId)
      .maybeSingle();

    const row = {
      ...data.brief,
      production_id: data.productionId,
      source_request: data.sourceRequest ?? null,
      created_by: context.userId,
    };

    if (existing) {
      const { data: updated, error } = await sb
        .from("studio_briefs")
        .update({ ...row, revision_count: (existing.revision_count ?? 0) + 1 })
        .eq("id", existing.id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      return updated;
    }

    const { data: created, error } = await sb.from("studio_briefs").insert(row).select("*").single();
    if (error) throw new Error(error.message);
    return created;
  });

/** Ask Frassy to revise the brief already on file. */
export const reviseBrief = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { productionId: string; instruction: string }) => {
    if (!input.productionId) throw new Error("Which production?");
    if (!input.instruction?.trim()) throw new Error("Tell Frassy what to change.");
    return { productionId: input.productionId, instruction: input.instruction.trim().slice(0, 2000) };
  })
  .handler(async ({ data, context }) => {
    const { requireStudioStaff, frassyJson, loadProductionContext, renderContext } = await import(
      "@/lib/studios/production-engine.server"
    );
    const sb = context.supabase as unknown as Db;
    await requireStudioStaff(sb, context.userId);

    const ctx = await loadProductionContext(sb, data.productionId);
    const { data: revised } = await frassyJson<Record<string, unknown>>(
      `Revise the Production Brief exactly as the Founder asks. Keep every field. Change only what the instruction touches.
Return the full brief object with these keys: working_title, episode_number, season, production_type, audience, age_group, objective, story_concept, characters, locations, target_duration_seconds, target_platforms, visual_direction, voice_direction, music_direction, educational_objective, special_instructions, note.`,
      `${renderContext(ctx)}\n\nCURRENT BRIEF:\n${JSON.stringify(ctx.brief ?? {}, null, 1)}\n\nFOUNDER INSTRUCTION:\n${data.instruction}`,
    );

    const { note: _note, ...fields } = revised as Record<string, unknown>;
    const { data: saved, error } = await sb
      .from("studio_briefs")
      .update({ ...fields, status: "draft" })
      .eq("production_id", data.productionId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { brief: saved, note: revised.note ?? null };
  });

/** Episode Development — concept, synopsis, beats, roles, locations, continuity, opportunities. */
export const developEpisode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { productionId: string; instruction?: string }) => {
    if (!input.productionId) throw new Error("Which production?");
    return { productionId: input.productionId, instruction: (input.instruction ?? "").slice(0, 2000) };
  })
  .handler(async ({ data, context }) => {
    const { requireStudioStaff, frassyJson, loadProductionContext, renderContext, StudioEngineError } = await import(
      "@/lib/studios/production-engine.server"
    );
    const sb = context.supabase as unknown as Db;
    await requireStudioStaff(sb, context.userId);

    const ctx = await loadProductionContext(sb, data.productionId);
    if (!ctx.brief || ctx.brief.status !== "approved") {
      throw new StudioEngineError("Approve the Production Brief first. Nothing expensive starts before you agree the plan.", "input");
    }

    const { data: dev, model } = await frassyJson<{
      concept: string;
      synopsis: string;
      story_beats: Array<{ label: string; beat: string }>;
      character_roles: Array<{ name: string; existing: boolean; purpose: string }>;
      locations: Array<{ name: string; existing: boolean; note: string }>;
      continuity_connections: Array<{ episode: string; connection: string }>;
      educational_objective: string;
      content_opportunities: Array<{ moment: string; format: string; why: string }>;
      canon_proposals: string[];
    }>(
      `Develop this episode from the approved brief and the Series Bible.
story_beats covers beginning, development, climax and resolution where the format allows.
character_roles marks existing=true for anyone already in the approved Character Library.
locations marks existing=true for places already recorded.
content_opportunities lists moments that could later become Shorts, Reels, trailers or teasers — do not create them, just name them.
canon_proposals lists anything that would change canon; it must never be assumed as agreed.`,
      `${renderContext(ctx)}\n\nAPPROVED BRIEF:\n${JSON.stringify(ctx.brief, null, 1)}\n\nEXTRA FOUNDER DIRECTION:\n${data.instruction || "(none)"}`,
    );

    const { data: prior } = await sb
      .from("studio_episode_development")
      .select("version")
      .eq("production_id", data.productionId)
      .order("version", { ascending: false })
      .limit(1);
    const nextVersion = ((prior?.[0]?.version as number) ?? 0) + 1;

    await sb.from("studio_episode_development").update({ is_current: false }).eq("production_id", data.productionId);

    const { data: saved, error } = await sb
      .from("studio_episode_development")
      .insert({
        production_id: data.productionId,
        version: nextVersion,
        is_current: true,
        concept: dev.concept,
        synopsis: dev.synopsis,
        story_beats: dev.story_beats ?? [],
        character_roles: dev.character_roles ?? [],
        locations: dev.locations ?? [],
        continuity_connections: dev.continuity_connections ?? [],
        educational_objective: dev.educational_objective ?? null,
        content_opportunities: dev.content_opportunities ?? [],
        generated_by: model,
        created_by: context.userId,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    await sb.from("studio_productions").update({ status: "draft" }).eq("id", data.productionId);
    return { development: saved, canonProposals: dev.canon_proposals ?? [] };
  });

/** Write the script from approved development. */
export const generateScript = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { productionId: string; instruction?: string }) => {
    if (!input.productionId) throw new Error("Which production?");
    return { productionId: input.productionId, instruction: (input.instruction ?? "").slice(0, 2000) };
  })
  .handler(async ({ data, context }) => {
    const { requireStudioStaff, frassyJson, loadProductionContext, renderContext, StudioEngineError } = await import(
      "@/lib/studios/production-engine.server"
    );
    const sb = context.supabase as unknown as Db;
    await requireStudioStaff(sb, context.userId);

    const ctx = await loadProductionContext(sb, data.productionId);
    if (!ctx.development) throw new StudioEngineError("Develop the episode first — Frassy writes from the agreed story.", "input");

    const { data: out, model } = await frassyJson<{
      title: string;
      sections: Array<{
        id: string;
        heading: string;
        summary: string;
        action: string;
        lines: Array<{ character: string; type: "dialogue" | "narration"; text: string; direction: string }>;
        camera: string;
        music: string;
        sfx: string;
        animation: string;
      }>;
    }>(
      `Write the full script as an ordered list of sections. One section per scene.
Each section carries a scene heading, a one-line summary, the action, the spoken lines, camera suggestions, music cues, sound cues and animation direction.
Every spoken line names the character speaking. Narration uses the narrator name from the brief, or "NARRATOR".
Give each section a short stable id like "s1", "s2".
Obey the age rules exactly. Obey the Series Bible exactly.`,
      `${renderContext(ctx)}\n\nEXTRA FOUNDER DIRECTION:\n${data.instruction || "(none)"}`,
    );

    const body = renderScriptBody(out.sections ?? []);
    const { data: existing } = await sb
      .from("studio_scripts")
      .select("id, version")
      .eq("production_id", data.productionId)
      .maybeSingle();

    let script;
    if (existing) {
      await sb.from("studio_script_versions").insert({
        script_id: existing.id,
        production_id: data.productionId,
        version: existing.version,
        body: ctx.script?.body ?? "",
        sections: ctx.script?.sections ?? [],
        change_note: "Replaced by a full rewrite",
        created_by: context.userId,
      });
      const { data: updated, error } = await sb
        .from("studio_scripts")
        .update({
          title: out.title,
          body,
          sections: out.sections ?? [],
          version: (existing.version ?? 1) + 1,
          word_count: body.split(/\s+/).length,
          status: "draft",
          generated_by: model,
        })
        .eq("id", existing.id)
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      script = updated;
    } else {
      const { data: created, error } = await sb
        .from("studio_scripts")
        .insert({
          production_id: data.productionId,
          title: out.title,
          body,
          sections: out.sections ?? [],
          word_count: body.split(/\s+/).length,
          generated_by: model,
          created_by: context.userId,
        })
        .select("*")
        .single();
      if (error) throw new Error(error.message);
      script = created;
    }

    await sb.from("studio_productions").update({ status: "script" }).eq("id", data.productionId);
    return script;
  });

function renderScriptBody(sections: Array<Record<string, any>>): string {
  return sections
    .map((s, i) => {
      const lines = (s.lines ?? [])
        .map((l: any) =>
          l.type === "narration"
            ? `  ${(l.character || "NARRATOR").toUpperCase()} (V.O.)\n    ${l.text}`
            : `  ${(l.character || "").toUpperCase()}${l.direction ? ` (${l.direction})` : ""}\n    ${l.text}`,
        )
        .join("\n\n");
      return [
        `${i + 1}. ${s.heading ?? "SCENE"}`,
        s.action ? `\n${s.action}` : "",
        lines ? `\n\n${lines}` : "",
        s.camera ? `\n\n[CAMERA] ${s.camera}` : "",
        s.animation ? `\n[ANIMATION] ${s.animation}` : "",
        s.music ? `\n[MUSIC] ${s.music}` : "",
        s.sfx ? `\n[SFX] ${s.sfx}` : "",
      ].join("");
    })
    .join("\n\n\n");
}

/** Rewrite ONE section. The rest of the script is never touched. */
export const reviseScriptSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { productionId: string; sectionId: string; mode: string; instruction?: string }) => {
    if (!input.productionId || !input.sectionId) throw new Error("Which section?");
    return {
      productionId: input.productionId,
      sectionId: input.sectionId,
      mode: input.mode || "rewrite",
      instruction: (input.instruction ?? "").slice(0, 1500),
    };
  })
  .handler(async ({ data, context }) => {
    const { requireStudioStaff, frassyJson, loadProductionContext, renderContext, StudioEngineError } = await import(
      "@/lib/studios/production-engine.server"
    );
    const sb = context.supabase as unknown as Db;
    await requireStudioStaff(sb, context.userId);

    const ctx = await loadProductionContext(sb, data.productionId);
    if (!ctx.script) throw new StudioEngineError("There is no script yet.", "input");

    const sections = (ctx.script.sections ?? []) as Array<Record<string, any>>;
    const target = sections.find((s) => s.id === data.sectionId);
    if (!target) throw new StudioEngineError("That section is no longer in the script.", "input");

    const modeInstruction =
      {
        shorten: "Make this section noticeably shorter while keeping every story beat.",
        expand: "Give this section more room — more life, more detail, same beats.",
        funnier: "Make this section funnier without breaking character or the age rules.",
        warmer: "Make this section warmer and more human.",
        simpler: "Make the language simpler for the age group.",
        rewrite: "Rewrite this section fresh.",
      }[data.mode] ?? "Rewrite this section fresh.";

    const { data: out } = await frassyJson<{ section: Record<string, any>; note: string }>(
      `Rewrite ONLY the one section given. Keep its id. Do not touch any other section.
${modeInstruction}
Return { "section": {...same shape as given...}, "note": "one sentence on what changed" }.`,
      `${renderContext(ctx)}\n\nSECTION TO REWRITE:\n${JSON.stringify(target, null, 1)}\n\nFOUNDER INSTRUCTION:\n${data.instruction || "(none)"}`,
    );

    const nextSections = sections.map((s) => (s.id === data.sectionId ? { ...out.section, id: data.sectionId } : s));
    const body = renderScriptBody(nextSections);

    await sb.from("studio_script_versions").insert({
      script_id: ctx.script.id,
      production_id: data.productionId,
      version: ctx.script.version,
      body: ctx.script.body,
      sections: ctx.script.sections,
      change_note: `Section ${data.sectionId} — ${data.mode}`,
      created_by: context.userId,
    });

    const { data: saved, error } = await sb
      .from("studio_scripts")
      .update({ sections: nextSections, body, version: (ctx.script.version ?? 1) + 1, word_count: body.split(/\s+/).length })
      .eq("id", ctx.script.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { script: saved, note: out.note };
  });

/** Turn the approved script into production-ready scenes. */
export const breakdownScenes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { productionId: string }) => {
    if (!input.productionId) throw new Error("Which production?");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { requireStudioStaff, frassyJson, loadProductionContext, renderContext, StudioEngineError } = await import(
      "@/lib/studios/production-engine.server"
    );
    const { findReusableAsset, reuseSummary } = await import("@/lib/studios/generation-layer");
    const sb = context.supabase as unknown as Db;
    await requireStudioStaff(sb, context.userId);

    const ctx = await loadProductionContext(sb, data.productionId);
    if (!ctx.script || ctx.script.status !== "approved")
      throw new StudioEngineError("Approve the script first, then Frassy breaks it into scenes.", "input");

    const { data: out } = await frassyJson<{
      scenes: Array<{
        scene_number: number;
        title: string;
        duration_seconds: number;
        location: string;
        characters: string[];
        dialogue: string;
        narration: string;
        action: string;
        camera_direction: string;
        visual_prompt: string;
        animation_notes: string;
        voice_notes: string;
        music: string;
        sfx: string;
        props: string[];
        wardrobe: string;
      }>;
    }>(
      `Break the approved script into production scenes, in order, numbered from 1.
Each scene must be able to be made on its own without the others.
visual_prompt describes what is seen, faithful to the approved character and location descriptions.
Keep durations realistic for the age group and the target runtime.`,
      renderContext(ctx, { includeScript: true }),
    );

    const { data: assets } = await sb.from("studio_assets").select("id, name, tags, approved, reuse_allowed");
    const { data: animations } = await sb.from("studio_animations").select("id, name, tags, approved, reuse_allowed");
    const library = [...(assets ?? []), ...(animations ?? [])];

    // Existing scenes are replaced, but their words are kept as history first.
    for (const scene of ctx.scenes) {
      await sb.from("studio_scene_versions").insert({
        scene_id: scene.id,
        production_id: data.productionId,
        version: 1,
        snapshot: scene,
        change_note: "Replaced by a fresh scene breakdown",
        created_by: context.userId,
      });
    }
    if (ctx.scenes.length) await sb.from("studio_scenes").delete().eq("production_id", data.productionId);

    const decisions = [];
    const rows = [];
    for (const s of out.scenes ?? []) {
      const locationDecision = findReusableAsset(s.location ?? "", library as never);
      decisions.push(locationDecision);
      for (const c of s.characters ?? []) decisions.push(findReusableAsset(c, library as never));

      rows.push({
        production_id: data.productionId,
        scene_number: s.scene_number,
        title: s.title,
        duration_seconds: Math.round(s.duration_seconds ?? 0) || null,
        location: s.location ?? null,
        characters: s.characters ?? [],
        dialogue: s.dialogue ?? null,
        narration: s.narration ?? null,
        script: s.action ?? null,
        camera_direction: s.camera_direction ?? null,
        visual_prompt: s.visual_prompt ?? null,
        animation_notes: [s.animation_notes, s.wardrobe ? `Wardrobe: ${s.wardrobe}` : "", (s.props ?? []).length ? `Props: ${(s.props ?? []).join(", ")}` : ""]
          .filter(Boolean)
          .join("\n"),
        audio_notes: s.voice_notes ?? null,
        music: s.music ?? null,
        sfx: s.sfx ?? null,
      });
    }

    const { data: created, error } = await sb.from("studio_scenes").insert(rows).select("*");
    if (error) throw new Error(error.message);

    await sb.from("studio_productions").update({ status: "storyboard" }).eq("id", data.productionId);
    return { scenes: created ?? [], reuse: reuseSummary(decisions), decisions: decisions.slice(0, 40) };
  });

/** Rewrite ONE scene. Scenes before and after are never regenerated. */
export const reviseScene = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { productionId: string; sceneId: string; instruction: string }) => {
    if (!input.sceneId) throw new Error("Which scene?");
    return { ...input, instruction: (input.instruction ?? "").slice(0, 1500) };
  })
  .handler(async ({ data, context }) => {
    const { requireStudioStaff, frassyJson, loadProductionContext, renderContext, StudioEngineError } = await import(
      "@/lib/studios/production-engine.server"
    );
    const sb = context.supabase as unknown as Db;
    await requireStudioStaff(sb, context.userId);

    const ctx = await loadProductionContext(sb, data.productionId);
    const scene = ctx.scenes.find((s) => s.id === data.sceneId);
    if (!scene) throw new StudioEngineError("That scene no longer exists.", "input");

    const { data: out } = await frassyJson<{ scene: Record<string, any>; note: string }>(
      `Rewrite ONLY this one scene. Its number stays the same. Do not renumber, add or remove any other scene.
Return { "scene": { "title", "duration_seconds", "location", "characters", "dialogue", "narration", "action", "camera_direction", "visual_prompt", "animation_notes", "audio_notes", "music", "sfx" }, "note": "one sentence" }.`,
      `${renderContext(ctx, { includeScenes: true })}\n\nSCENE TO REWRITE (number ${scene.scene_number}):\n${JSON.stringify(scene, null, 1)}\n\nFOUNDER INSTRUCTION:\n${data.instruction || "(none)"}`,
    );

    await sb.from("studio_scene_versions").insert({
      scene_id: scene.id,
      production_id: data.productionId,
      version: 1,
      snapshot: scene,
      change_note: data.instruction || "Scene rewrite",
      created_by: context.userId,
    });

    const s = out.scene ?? {};
    const { data: saved, error } = await sb
      .from("studio_scenes")
      .update({
        title: s.title ?? scene.title,
        duration_seconds: Math.round(s.duration_seconds ?? 0) || scene.duration_seconds,
        location: s.location ?? scene.location,
        characters: s.characters ?? scene.characters,
        dialogue: s.dialogue ?? scene.dialogue,
        narration: s.narration ?? scene.narration,
        script: s.action ?? scene.script,
        camera_direction: s.camera_direction ?? scene.camera_direction,
        visual_prompt: s.visual_prompt ?? scene.visual_prompt,
        animation_notes: s.animation_notes ?? scene.animation_notes,
        audio_notes: s.audio_notes ?? scene.audio_notes,
        music: s.music ?? scene.music,
        sfx: s.sfx ?? scene.sfx,
        approval_status: "draft",
      })
      .eq("id", scene.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { scene: saved, note: out.note };
  });

/** Continuity Checker — compare the production against everything already true. */
export const checkContinuity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { productionId: string }) => {
    if (!input.productionId) throw new Error("Which production?");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { requireStudioStaff, frassyJson, loadProductionContext, renderContext } = await import(
      "@/lib/studios/production-engine.server"
    );
    const sb = context.supabase as unknown as Db;
    await requireStudioStaff(sb, context.userId);

    const ctx = await loadProductionContext(sb, data.productionId);
    const { data: out } = await frassyJson<{
      findings: Array<{
        severity: "warning" | "conflict" | "note";
        area: string;
        summary: string;
        detail: string;
        conflicts_with: string;
        suggestion: string;
        scene_number: number | null;
      }>;
      verdict: string;
    }>(
      `Check this production against the Series Bible, the Character Library, the timeline, established locations, character appearance and voice, relationships and unresolved storylines.
Report only genuine problems. An empty findings list is a good answer.
area is one of: canon, character, location, voice, timeline, relationship, appearance, educational, age_rules.
verdict is one warm sentence for the Founder.`,
      renderContext(ctx, { includeScenes: true, includeScript: true }),
    );

    await sb.from("studio_continuity_findings").delete().eq("production_id", data.productionId).eq("resolution", "open");

    const rows = (out.findings ?? []).map((f) => {
      const scene = ctx.scenes.find((s) => s.scene_number === f.scene_number);
      return {
        production_id: data.productionId,
        scene_id: scene?.id ?? null,
        severity: f.severity ?? "warning",
        area: f.area ?? "canon",
        summary: f.summary,
        detail: f.detail ?? null,
        conflicts_with: f.conflicts_with ?? null,
        suggestion: f.suggestion ?? null,
      };
    });
    if (rows.length) {
      const { error } = await sb.from("studio_continuity_findings").insert(rows);
      if (error) throw new Error(error.message);
    }
    return { count: rows.length, verdict: out.verdict };
  });

/** Smart clip selection — which moments deserve to become social versions. */
export const suggestClips = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { productionId: string }) => {
    if (!input.productionId) throw new Error("Which production?");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { requireStudioStaff, frassyJson, loadProductionContext, renderContext } = await import(
      "@/lib/studios/production-engine.server"
    );
    const sb = context.supabase as unknown as Db;
    await requireStudioStaff(sb, context.userId);

    const ctx = await loadProductionContext(sb, data.productionId);
    const { data: out } = await frassyJson<{
      suggestions: Array<{
        derivative_type: string;
        platform: string;
        scene_numbers: number[];
        hook: string;
        why: string;
        strength: string;
        seconds: number;
      }>;
    }>(
      `Find the moments in this production worth cutting into platform versions.
Judge on: strong opening, humour, emotion, important dialogue, educational value, a reveal, a cliffhanger, a character moment, visual interest — name which one in "strength".
derivative_type is one of: youtube_episode, highlight_60, youtube_short, instagram_reel, tiktok_clip, teaser_15, trailer, hill_clip.
platform is one of: youtube, tiktok, instagram, facebook, frass_hill.
Suggest at most eight. The Founder chooses; nothing is created automatically.`,
      renderContext(ctx, { includeScenes: true }),
    );
    return out.suggestions ?? [];
  });

/** Write the platform package for one approved derivative. */
export const buildPlatformPackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { productionId: string; platform: string; derivativeType?: string; masterId?: string }) => {
    if (!input.productionId || !input.platform) throw new Error("Which production and platform?");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { requireStudioStaff, frassyJson, loadProductionContext, renderContext } = await import(
      "@/lib/studios/production-engine.server"
    );
    const sb = context.supabase as unknown as Db;
    await requireStudioStaff(sb, context.userId);

    const ctx = await loadProductionContext(sb, data.productionId);
    const { data: out, model } = await frassyJson<{
      title: string;
      description: string;
      caption: string;
      hashtags: string[];
      content_classification: string;
      thumbnail_concept: string;
    }>(
      `Write the publishing package for ${data.platform}. Match how people actually read on that platform.
Keep FRASS spelling exactly. Never promise earnings. content_classification says who this is suitable for.
thumbnail_concept describes the cover image in one sentence — do not claim to have made it.`,
      `${renderContext(ctx)}\n\nDERIVATIVE TYPE: ${data.derivativeType ?? "full"}`,
    );

    const { data: saved, error } = await sb
      .from("studio_platform_packages")
      .insert({
        production_id: data.productionId,
        master_id: data.masterId ?? null,
        platform: data.platform,
        derivative_type: data.derivativeType ?? null,
        title: out.title,
        description: out.description,
        caption: out.caption,
        hashtags: out.hashtags ?? [],
        content_classification: out.content_classification,
        series_reference: ctx.series?.name ?? null,
        episode_reference: ctx.production?.episode_number ? `Episode ${ctx.production.episode_number}` : null,
        rights_status: ctx.production?.rights_status ?? "pending_review",
        generated_by: model,
        created_by: context.userId,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { package: saved, thumbnailConcept: out.thumbnail_concept };
  });

/** Frassy, in the room, with the production already open. */
export const askFrassyProduction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { productionId: string; question: string }) => {
    if (!input.question?.trim()) throw new Error("Ask Frassy something.");
    return { productionId: input.productionId, question: input.question.trim().slice(0, 3000) };
  })
  .handler(async ({ data, context }) => {
    const { requireStudioStaff, frassyJson, loadProductionContext, renderContext } = await import(
      "@/lib/studios/production-engine.server"
    );
    const sb = context.supabase as unknown as Db;
    await requireStudioStaff(sb, context.userId);

    const ctx = await loadProductionContext(sb, data.productionId);
    const { data: out } = await frassyJson<{ answer: string; suggestions: string[] }>(
      `Answer the Founder about the production that is open. You already know it — do not ask them to explain it again.
Return { "answer": "your reply in plain warm English, markdown allowed", "suggestions": ["up to three next actions"] }.`,
      `${renderContext(ctx, { includeScenes: true })}\n\nFOUNDER:\n${data.question}`,
    );
    return out;
  });
