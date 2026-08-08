// Frassy Workspace Room — the room *is* the workspace.
// Owns projects, collapsible conversation sections, the smart index, the
// timeline, and the persistent composer. Frassy adapts to the open project.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Plus, Send, Volume2, VolumeX, Square } from "lucide-react";
import { WorkspaceShell, type IndexEntry } from "@/components/workspace/workspace-shell";
import { UploadTray } from "@/components/workspace/upload-tray";
import { ReplyBlocks } from "@/components/workspace/reply-blocks";
import { usePushToTalk } from "@/hooks/use-push-to-talk";
import { useIsAdminStatus } from "@/hooks/use-is-admin";
import {
  FOUNDER_MILESTONES,
  FOUNDER_PROJECTS,
  FOUNDER_TASKS,
  PANEL_PRESETS,
  PROJECT_BY_ID,
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

export function WorkspaceRoom({
  roomName = "Founder Room",
  roomKind = "Founder workspace",
  projects = FOUNDER_PROJECTS,
}: {
  roomName?: string;
  roomKind?: string;
  projects?: WorkspaceProject[];
} = {}) {
  const [sections, setSections] = useState<Section[]>(() => load());
  const [activeProjectId, setActiveProjectId] = useState(projects[0].id);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speakReplies, setSpeakReplies] = useState(true);
  const [note, setNote] = useState<string | null>(null);

  const { isAdmin } = useIsAdminStatus();
  const voice = usePushToTalk();
  const turnRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const project = PROJECT_BY_ID(activeProjectId);

  useEffect(() => {
    if (typeof window !== "undefined")
      window.localStorage.setItem(STORE_KEY, JSON.stringify(sections));
  }, [sections]);

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

  function trayPick(label: string, files?: FileList | null) {
    const names = files ? Array.from(files).map((f) => f.name).join(", ") : "";
    setNote(
      names
        ? `${label} attached: ${names} — Frassy will review it with this project.`
        : `${label} is docked to this room. Frassy will pick it up in this project.`,
    );
    window.setTimeout(() => setNote(null), 3200);
  }

  return (
    <WorkspaceShell
      roomName={roomName}
      roomKind={roomKind}
      frassyRole={project.frassyRole}
      projects={projects}
      activeProjectId={activeProjectId}
      onSelectProject={setActiveProjectId}
      index={index}
      onJumpTo={jumpTo}
      milestones={FOUNDER_MILESTONES}
      tasks={FOUNDER_TASKS}
      panel={PANEL_PRESETS[project.panel]}
      composer={
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            trayPick("Drag & Drop", e.dataTransfer.files);
          }}
        >
          {note && <p className="ws-note">{note}</p>}
          <UploadTray
            onPick={trayPick}
            onMic={voice.voiceAvailable ? () => void toggleMic() : undefined}
            micActive={voice.phase === "recording"}
          />
          <form
            className="mt-2 flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <button type="button" className="ws-icon" onClick={newTopic} aria-label="Start a new topic">
              <Plus className="h-4 w-4" />
            </button>
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder={`Work with Frassy on ${project.name}…`}
              className="ws-input"
            />
            <button
              type="button"
              className="ws-icon"
              aria-label={speakReplies ? "Mute Frassy" : "Let Frassy speak"}
              onClick={() => {
                if (speakReplies && voice.phase === "speaking") voice.stopSpeaking();
                setSpeakReplies((v) => !v);
              }}
            >
              {speakReplies ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            {loading ? (
              <button
                type="button"
                className="ws-send"
                aria-label="Stop"
                onClick={() => {
                  turnRef.current += 1;
                  abortRef.current?.abort();
                  setLoading(false);
                }}
              >
                <Square className="h-4 w-4" />
              </button>
            ) : (
              <button type="submit" className="ws-send" aria-label="Send" disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </button>
            )}
          </form>
        </div>
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
