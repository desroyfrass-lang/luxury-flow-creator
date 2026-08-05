import { FIRST_STAGE } from "@/lib/journey";

export type JourneyMessageRecord = {
  id: string;
  role: "user" | "assistant";
  content: string;
  stage: string;
  created_at: string;
};

export type JourneyMemoryRecord = {
  category: string;
  key: string;
  value: string;
};

export type JourneyStateRecord = {
  status: string;
  currentStage: string;
  stageProgress: Record<string, { completedAt?: string }>;
  startedAt: string;
  lastActiveAt: string;
  completedAt: string | null;
  messages: JourneyMessageRecord[];
  memory: JourneyMemoryRecord[];
};

export type JourneyDatabase = { from: (table: string) => any; rpc?: unknown };

const MEMORY_MARK = "[[MEMORY]]";
const STAGE_MARK = "[[STAGE_COMPLETE]]";

export function parseJourneyMarkers(raw: string) {
  let text = raw;
  let stageComplete = false;
  const memory: { key: string; value: string }[] = [];

  if (text.includes(STAGE_MARK)) {
    stageComplete = true;
    text = text.split(STAGE_MARK).join("");
  }

  const memoryIndex = text.indexOf(MEMORY_MARK);
  if (memoryIndex >= 0) {
    const tail = text.slice(memoryIndex + MEMORY_MARK.length).trim();
    text = text.slice(0, memoryIndex);
    const start = tail.indexOf("[");
    const end = tail.lastIndexOf("]");
    if (start >= 0 && end > start) {
      try {
        const parsed = JSON.parse(tail.slice(start, end + 1)) as unknown;
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            const record = item as { key?: unknown; value?: unknown };
            if (typeof record.key === "string" && typeof record.value === "string") {
              memory.push({
                key: record.key.slice(0, 120),
                value: record.value.slice(0, 2000),
              });
            }
          }
        }
      } catch {
        // Invalid hidden metadata is discarded rather than shown or persisted.
      }
    }
  }

  return { text: text.trim(), stageComplete, memory };
}

export async function loadJourneyState(
  database: JourneyDatabase,
  userId: string,
): Promise<JourneyStateRecord> {
  const { data: existing, error: existingError } = await database
    .from("builder_journeys")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (existingError) throw new Error(existingError.message);

  let journey = existing;
  if (!journey) {
    const { data, error } = await database
      .from("builder_journeys")
      .insert({ user_id: userId, current_stage: FIRST_STAGE })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    journey = data;
  }

  const [messageResult, memoryResult] = await Promise.all([
    database
      .from("builder_journey_messages")
      .select("id, role, content, stage, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
    database
      .from("builder_memory")
      .select("category, key, value")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
  ]);
  if (messageResult.error) throw new Error(messageResult.error.message);
  if (memoryResult.error) throw new Error(memoryResult.error.message);

  return {
    status: journey.status,
    currentStage: journey.current_stage,
    stageProgress: (journey.stage_progress ?? {}) as JourneyStateRecord["stageProgress"],
    startedAt: journey.started_at,
    lastActiveAt: journey.last_active_at,
    completedAt: journey.completed_at,
    messages: (messageResult.data ?? []) as JourneyMessageRecord[],
    memory: (memoryResult.data ?? []) as JourneyMemoryRecord[],
  };
}