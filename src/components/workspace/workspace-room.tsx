// My Workspace — the single canonical professional workspace of Frass OS.
// One workspace, many modes. Owns projects, collapsible conversation sections,
// the smart index, the timeline, and the persistent composer. Frassy adapts to
// the open project and reopens exactly where work stopped.

import { readArrivalIntent } from "@/lib/frassy/context";
import { appendTranscript } from "@/lib/frassy/transcript";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { WorkspaceShell, type IndexEntry, type RoleLink } from "@/components/workspace/workspace-shell";
import { AwarenessRail } from "@/components/workspace/awareness-rail";
import { recordActivity } from "@/lib/workspace/awareness";
import { FrassyComposer } from "@/components/workspace/frassy-composer";
import { ReplyBlocks } from "@/components/workspace/reply-blocks";
import { openTheDaily } from "@/components/workspace/daily-gate";
import { usePushToTalk } from "@/hooks/use-push-to-talk";
import { useIsAdminStatus } from "@/hooks/use-is-admin";
import { useWorkspaceRoles } from "@/hooks/use-workspace-roles";

import {
  FOUNDER_MILESTONES,
  FOUNDER_PROJECTS,
  FOUNDER_TASKS,
  MODE_BY_ID,
  PANEL_PRESETS,
  PROJECTS_FOR_MODE,
  PROJECT_BY_ID,
  WORKSPACE_MODES,
  type WorkspaceProject,
} from "@/lib/workspace/workspace-config";

type Msg = { id: string; role: "user" | "assistant"; content: string };
type Section = {
  id: string;
  title: string;
  projectId: string;
  group: string;
  open: boolean;
  messages: Msg[];
};

const STORE_KEY = "frass.workspace.v1";
const PROJECT_KEY = "frass.workspace.project";
const MODE_KEY = "frass.workspace.mode";
let seq = 0;
const nid = (p: string) => `${p}${++seq}-${Date.now()}`;

function load(): Section[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Section[]) : [];
  } catch {
    return [];
  }
}

function loadLast(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return window.localStorage.getItem(key) ?? fallback;
}

import { FrassLinkWidget } from "@/components/link/frass-link-widget";

export function WorkspaceRoom({
  roomName = "My Workspace",
  roomKind = "Frass OS workspace",
  projects = FOUNDER_PROJECTS,
}: {
  roomName?: string;
  roomKind?: string;
  projects?: WorkspaceProject[];
} = {}) {
  const [sections, setSections] = useState<Section[]>(() => load());
  const [modeId, setModeId] = useState(() => loadLast(MODE_KEY, WORKSPACE_MODES[0].id));
  const [activeProjectId, setActiveProjectId] = useState(() =>
    loadLast(PROJECT_KEY, projects[0].id),
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speakReplies, setSpeakReplies] = useState(true);
  const [note, setNote] = useState<string | null>(null);
  const [awarenessPulse, setAwarenessPulse] = useState(0);

  const { isAdmin } = useIsAdminStatus();
  const businessRoles = useWorkspaceRoles();

  // Role-specific navigation appears automatically; Workspace + Daily are always there.
  const roleLinks: RoleLink[] = useMemo(() => {
    const links: RoleLink[] = [];
    if (isAdmin) {
      links.push({ to: "/founder", label: "Founder Dashboard", emoji: "🏛" });
      links.push({ to: "/admin", label: "Admin", emoji: "🛠" });
      links.push({ to: "/admin/affiliate-policy", label: "Governance", emoji: "⚖️" });
    }
    if (businessRoles.includes("partner")) {
      links.push({ to: "/workspace/merch", label: "Marketplace", emoji: "🏬" });
      links.push({ to: "/admin/partner-vendors", label: "Vendors", emoji: "📦" });
    }
    if (businessRoles.includes("affiliate")) {
      links.push({ to: "/workspace/affiliate", label: "Affiliate", emoji: "🤝" });
    }
    if (businessRoles.includes("designer")) {
      links.push({ to: "/creation", label: "Creator Studio", emoji: "🎨" });
    }
    links.push({ to: "/academy", label: "Academy", emoji: "🎓" });
    return links;
  }, [isAdmin, businessRoles]);

  const voice = usePushToTalk();

  const turnRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const modeProjects = useMemo(() => {
    const inMode = PROJECTS_FOR_MODE(modeId).filter((p) => projects.some((x) => x.id === p.id));
    return inMode.length ? inMode : projects;
  }, [modeId, projects]);

  const project = PROJECT_BY_ID(activeProjectId);

  useEffect(() => {
    if (typeof window !== "undefined")
      window.localStorage.setItem(STORE_KEY, JSON.stringify(sections));
  }, [sections]);

  // Workspace continuity — reopen exactly where you left off.
  useEffect(() => {
    window.localStorage.setItem(PROJECT_KEY, activeProjectId);
  }, [activeProjectId]);
  useEffect(() => {
    window.localStorage.setItem(MODE_KEY, modeId);
  }, [modeId]);

  // Switching mode never reloads the workspace; it just changes the tools.
  useEffect(() => {
    if (!modeProjects.some((p) => p.id === activeProjectId)) {
      setActiveProjectId(modeProjects[0].id);
    }
  }, [modeProjects, activeProjectId]);

  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeProjectId]);


  const visible = useMemo(
    () => sections.filter((s) => s.projectId === activeProjectId),
    [sections, activeProjectId],
  );

  const index: IndexEntry[] = useMemo(
    () => sections.map((s) => ({ id: s.id, label: s.title, group: s.group })),
    [sections],
  );

  /** The exact position inside the project — restored on every return. */
  const focus = visible.length ? visible[visible.length - 1].title : undefined;


  const openSectionFor = useCallback(
    (text: string) => {
      let id = "";
      setSections((prev) => {
        const mine = prev.filter((s) => s.projectId === activeProjectId);
        const last = mine[mine.length - 1];
        if (last) {
          id = last.id;
          return prev.map((s) => (s.id === last.id ? { ...s, open: true } : s));
        }
        id = nid("s");
        return [
          ...prev,
          {
            id,
            title: text.slice(0, 48) || project.name,
            projectId: activeProjectId,
            group: "Today's session",
            open: true,
            messages: [],
          },
        ];
      });
      return id;
    },
    [activeProjectId, project.name],
  );

  const push = (sectionId: string, msg: Msg) =>
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, messages: [...s.messages, msg] } : s)),
    );

  async function send(override?: string, spoken = false) {
    if (loading) return;
    const text = (override ?? input).trim();
    if (!text) return;

    const myTurn = ++turnRef.current;
    const sectionId = openSectionFor(text);
    push(sectionId, { id: nid("m"), role: "user", content: text });
    setInput("");
    setError(null);
    setLoading(true);

    const history = [
      ...(sections.find((s) => s.id === sectionId)?.messages ?? []),
      { role: "user" as const, content: text },
    ].map((m) => ({ role: m.role, content: m.content }));

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `[Workspace context] Project: ${project.name}. Act as my ${project.frassyRole}.`,
            },
            ...history,
          ],
          modeContext: "workspace",
          experienceContext: isAdmin ? "founder" : "builder",
          // FRASS-0451A — where we are, and why they came.
          districtPath: typeof window !== "undefined" ? window.location.pathname : undefined,
          arrivalIntent: readArrivalIntent() ?? undefined,
          interactionMode: spoken ? "voice_and_text" : "text",
          voiceAvailable: voice.voiceAvailable,
          stream: false,
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (turnRef.current !== myTurn) return;
      if (!res.ok || data.error) {
        setError(data.error ?? "I hit a snag reaching my systems. Try again in a sec?");
        return;
      }
      const reply = data.reply?.trim() || "…";
      push(sectionId, { id: nid("m"), role: "assistant", content: reply });
      // FRASS-0476B — one shared conversation history across every room.
      appendTranscript({ role: "user", content: text }, { role: "assistant", content: reply });
      // Workspace Awareness — real work, recorded honestly.
      recordActivity(activeProjectId);
      setAwarenessPulse((n) => n + 1);
      if ((spoken || speakReplies) && voice.voiceAvailable) {
        setLoading(false);
        await voice.speak(reply);
      }
    } catch (err) {
      if (turnRef.current !== myTurn) return;
      if ((err as Error)?.name === "AbortError") return;
      setError("I hit a snag reaching my systems. Try again in a sec?");
    } finally {
      if (turnRef.current === myTurn) {
        setLoading(false);
        abortRef.current = null;
        inputRef.current?.focus();
      }
    }
  }

  async function toggleMic() {
    if (voice.phase === "speaking") return voice.stopSpeaking();
    if (voice.phase === "recording") {
      const transcript = await voice.stopRecording();
      if (!transcript) return;
      const typed = input.trim();
      await send(typed ? `${typed} ${transcript}` : transcript, true);
      return;
    }
    if (voice.phase === "idle" && !loading) await voice.startRecording();
  }

  function newTopic() {
    const id = nid("s");
    setSections((prev) => [
      ...prev,
      {
        id,
        title: `${project.name} — new topic`,
        projectId: activeProjectId,
        group: "Today's session",
        open: true,
        messages: [],
      },
    ]);
    inputRef.current?.focus();
  }

  function jumpTo(id: string) {
    const s = sections.find((x) => x.id === id);
    if (!s) return;
    setActiveProjectId(s.projectId);
    setSections((prev) => prev.map((x) => (x.id === id ? { ...x, open: true } : x)));
    window.setTimeout(() => {
      document.getElementById(`ws-sec-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  return (
    <WorkspaceShell
      roomName={roomName}
      roomKind={`${roomKind} · ${MODE_BY_ID(modeId).name}`}
      frassyRole={project.frassyRole}
      modes={WORKSPACE_MODES}
      activeModeId={modeId}
      onSelectMode={setModeId}
      onOpenDaily={openTheDaily}
      projects={modeProjects}
      activeProjectId={activeProjectId}
      onSelectProject={setActiveProjectId}
      roleLinks={roleLinks}
      focus={focus}
      index={index}
      onJumpTo={jumpTo}
      milestones={FOUNDER_MILESTONES}
      tasks={FOUNDER_TASKS}
      panel={PANEL_PRESETS[project.panel]}
      composer={
        // FRASS-0400 — the Frassy Workspace Composer. One workstation, every role.
        <FrassyComposer
          value={input}
          onChange={setInput}
          loading={loading}
          inputRef={inputRef}
          placeholder={`Work with Frassy on ${project.name}…`}
          onSend={(text, intake) =>
            void send(intake ? `${text}\n\n[Attached for review] ${intake}` : text)
          }
          onStop={() => {
            turnRef.current += 1;
            abortRef.current?.abort();
            setLoading(false);
          }}
          onNewTopic={newTopic}
          onMic={voice.voiceAvailable ? () => void toggleMic() : undefined}
          micAvailable={voice.voiceAvailable}
          micActive={voice.phase === "recording"}
          speaking={speakReplies}
          onToggleSpeech={() => {
            if (speakReplies && voice.phase === "speaking") voice.stopSpeaking();
            setSpeakReplies((v) => !v);
          }}
          onIntake={(summary) => {
            setNote(`${summary} received — filed to ${project.name}.`);
            window.setTimeout(() => setNote(null), 3600);
            recordActivity(activeProjectId);
          }}
          header={
            <>
              <AwarenessRail
                projectName={project.name}
                alternateName={modeProjects.find((p) => p.id !== activeProjectId)?.name}
                alternateId={modeProjects.find((p) => p.id !== activeProjectId)?.id}
                onSwitchProject={setActiveProjectId}
                onAsk={(prompt) => void send(prompt)}
                pulse={awarenessPulse}
              />
              {note && <p className="ws-note">{note}</p>}
            </>
          }
        />
      }
    >
      <div ref={scrollRef} className="mx-auto w-full max-w-3xl px-6 py-8">
        <div className="ws-meta">{project.emoji} {project.name}</div>
        <h1 className="ws-h1">{project.opener}</h1>

        {visible.length === 0 && (
          <p className="ws-reply-p mt-4 opacity-70">
            This room is prepared. Speak or type and Frassy opens a working section for
            {` ${project.name}`}.
          </p>
        )}

        <div className="mt-6">
          <FrassLinkWidget context="My Workspace" />
        </div>

        <div className="mt-6 space-y-4">
          {visible.map((s) => (
            <section key={s.id} id={`ws-sec-${s.id}`} className="ws-section">
              <button
                type="button"
                className="ws-section-head"
                onClick={() =>
                  setSections((prev) =>
                    prev.map((x) => (x.id === s.id ? { ...x, open: !x.open } : x)),
                  )
                }
              >
                {s.open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <span className="flex-1 truncate text-left font-semibold">{s.title}</span>
                <span className="ws-meta">{s.messages.length} entries</span>
              </button>
              {s.open && (
                <div className="space-y-4 px-4 pb-4">
                  {s.messages.map((m) =>
                    m.role === "user" ? (
                      <div key={m.id} className="ws-user">{m.content}</div>
                    ) : (
                      <div key={m.id} className="ws-assistant">
                        <ReplyBlocks text={m.content} />
                      </div>
                    ),
                  )}
                </div>
              )}
            </section>
          ))}
        </div>

        {loading && <p className="ws-meta mt-4">Frassy is working…</p>}
        {(error || voice.voiceError) && <p className="ws-error mt-4">{error ?? voice.voiceError}</p>}
      </div>
    </WorkspaceShell>
  );
}
