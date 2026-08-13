// FRASS-0547 — Founder Success Dashboard · FRASS-0548 — Founder Visibility.
// Founder-only. Every read is verified server-side (FRASS-0530 Zero Trust);
// exact personal money never leaves this handler — only ranges are returned.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  archetypeReason,
  buildRadar,
  coachingPriority,
  founderActions,
  likelyOutcome,
  memberNeed,
  observedBehaviours,
  recommendedAction,
  memberInsight,
  progressScore,
  revenueBand,
  toneFor,
  type MemberNeed,
  type MemberProgress,
  type RadarBucket,
} from "./success-dashboard";

export type FounderSuccessOverview = {
  generatedAt: string;
  totals: { members: number; thriving: number; growing: number; encouragement: number; support: number };
  radar: RadarBucket[];
  members: MemberProgress[];
  sentence: string;
};

async function assertFounder(context: { supabase: any; userId: string }) {
  // FRASS-0548 — fail closed. Any error, any non-admin, any doubt → 403.
  let ok = false;
  try {
    const role = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    ok = role.data === true;
  } catch {
    ok = false;
  }
  if (!ok) {
    throw new Response("Forbidden — Founder access only.", { status: 403 });
  }
}

const daysSince = (iso: string | null | undefined): number => {
  if (!iso) return 99;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 99;
  return Math.max(0, Math.floor((Date.now() - t) / 86_400_000));
};

export const founderSuccessOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<FounderSuccessOverview> => {
    await assertFounder(context);
    const sb = context.supabase;

    const [profiles, journeys, opps, launches, books, vaults] = await Promise.all([
      sb
        .from("profiles")
        .select(
          "id, display_name, full_name, email, preferences, last_seen_at, handle, builder_stage",
        )
        .order("created_at", { ascending: false })
        .limit(500),
      sb.from("builder_journeys").select("user_id, status, last_active_at, stage_progress"),
      sb.from("builder_opportunities").select("user_id, stage, potential_value"),
      sb.from("partner_launch_state").select("user_id, state, updated_at"),
      sb.from("legacy_publications").select("owner_id, status"),
      sb.from("future_business_vaults").select("user_id, label, status"),
    ]);

    const journeyBy = new Map<string, any>();
    for (const j of journeys.data ?? []) journeyBy.set(j.user_id, j);
    const launchBy = new Map<string, any>();
    for (const l of launches.data ?? []) launchBy.set(l.user_id, l);

    const oppBy = new Map<string, { active: number; done: number; earned: number }>();
    for (const o of opps.data ?? []) {
      const row = oppBy.get(o.user_id) ?? { active: 0, done: 0, earned: 0 };
      if (o.stage === "won") {
        row.done += 1;
        row.earned += Number(o.potential_value ?? 0);
      } else {
        row.active += 1;
      }
      oppBy.set(o.user_id, row);
    }

    const bookBy = new Map<string, { progress: number; published: number }>();
    for (const b of books.data ?? []) {
      const row = bookBy.get(b.owner_id) ?? { progress: 0, published: 0 };
      if (b.status === "published") row.published += 1;
      else row.progress += 1;
      bookBy.set(b.owner_id, row);
    }

    // FRASS-0550 — 👤 Who: active Business Vault names only, never contents.
    const vaultBy = new Map<string, string[]>();
    for (const v of vaults.data ?? []) {
      if (v.status === "shelved") continue;
      const list = vaultBy.get(v.user_id) ?? [];
      list.push(v.label as string);
      vaultBy.set(v.user_id, list);
    }

    const members: MemberProgress[] = (profiles.data ?? []).map((p: any) => {
      const prefs = (p.preferences ?? {}) as Record<string, any>;
      const journey = journeyBy.get(p.id);
      const launch = launchBy.get(p.id);
      const opp = oppBy.get(p.id) ?? { active: 0, done: 0, earned: 0 };
      const book = bookBy.get(p.id) ?? { progress: 0, published: 0 };

      const stageProgress = (journey?.stage_progress ?? {}) as Record<string, unknown>;
      const stagesDone = Object.values(stageProgress).filter(Boolean).length;
      const blueprintProgress = Math.min(100, stagesDone * 7);

      const daysQuiet = Math.min(
        daysSince(p.last_seen_at),
        daysSince(journey?.last_active_at),
        daysSince(launch?.updated_at),
      );
      const dailyStreak = Number((launch?.state as any)?.streak ?? 0) || 0;
      const projectsCompleted = opp.done + book.published;

      const progress = progressScore({
        blueprintProgress,
        moneyMovesCompleted: opp.done,
        projectsCompleted,
        booksPublished: book.published,
        dailyStreak,
      });
      const tone = toneFor({ daysQuiet, progress, moneyMovesCompleted: opp.done });

      const base = {
        userId: p.id as string,
        name: (p.display_name || p.full_name || p.email || "Member") as string,
        progress,
        achievementStyle: (prefs.achievement_style as string) ?? null,
        momentumLevel: (prefs.momentum_level as string) ?? null,
        dailyStreak,
        daysQuiet,
        blueprintProgress,
        moneyMovesActive: opp.active,
        moneyMovesCompleted: opp.done,
        projectsCompleted,
        booksInProgress: book.progress,
        booksPublished: book.published,
        // Only ever a band. The underlying figure stays on the server.
        revenue: revenueBand(opp.earned),
        coachingOptIn: prefs.founder_coaching === true,
        handle: (p.handle as string) ?? null,
        builderStage: (p.builder_stage as string) ?? null,
        learningLevel: (prefs.learning_level as string) ?? null,
        vaults: (vaultBy.get(p.id) ?? []).slice(0, 6),
      };

      // FRASS-0550 — the five questions, answered for every member.
      const need: MemberNeed = memberNeed(base, tone);

      return {
        ...base,
        tone,
        insight: memberInsight(base, tone),
        archetypeReason: archetypeReason(base, tone),
        recommendedAction: recommendedAction(base, tone),
        observedBehaviours: observedBehaviours(base),
        need,
        founderActions: founderActions(base, need),
        likelyOutcome: likelyOutcome(base, need),
        coachingPriority: coachingPriority(base, need, tone),
      };
    });

    const count = (t: MemberProgress["tone"]) => members.filter((m) => m.tone === t).length;
    const support = count("support");
    const encouragement = count("encouragement");

    return {
      generatedAt: new Date().toISOString(),
      totals: {
        members: members.length,
        thriving: count("thriving"),
        growing: count("growing"),
        encouragement,
        support,
      },
      radar: buildRadar(members),
      // FRASS-0550 — highest coaching impact first, so the Founder never hunts.
      members: members.sort(
        (a, b) => b.coachingPriority - a.coachingPriority || b.daysQuiet - a.daysQuiet,
      ),
      sentence: !members.length
        ? "No members yet. The first one is the one that matters most."
        : support
          ? `${support} member${support === 1 ? "" : "s"} may need you personally today.`
          : encouragement
            ? `Everyone is safe. ${encouragement} could use a word of encouragement.`
            : "Everyone is moving. Nothing needs you this morning.",
    };
  });
