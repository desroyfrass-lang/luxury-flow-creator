// Universal Workspace Shell — Header / Left Sidebar / Main / Right Panel /
// Persistent Composer. My Workspace is the single canonical workspace; modes
// change the tools, never the place.

import { type ReactNode, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ForUsLink } from "@/components/for-us-link";
import { VoiceFeedbackButton } from "@/components/feedback/voice-feedback";
import {
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Sun,
  Moon,
  Home,
  Sunrise,
  FolderOpen,
  Archive,
  User,
} from "lucide-react";
import symbolAsset from "@/assets/frass-logo-symbol.asset.json";
import {
  type Milestone,
  type PanelSection,
  type WorkspaceMode,
  type WorkspaceProject,
  type WorkspaceTask,
  TASK_LABELS,
} from "@/lib/workspace/workspace-config";

export type IndexEntry = { id: string; label: string; group: string };

/** Role-specific navigation that appears automatically inside My Workspace. */
export type RoleLink = { to: string; label: string; emoji: string };

type Props = {
  roomName: string;
  roomKind: string;
  frassyRole: string;
  modes: WorkspaceMode[];
  activeModeId: string;
  onSelectMode: (id: string) => void;
  onOpenDaily: () => void;
  projects: WorkspaceProject[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  roleLinks: RoleLink[];
  index: IndexEntry[];
  onJumpTo: (id: string) => void;
  milestones: Milestone[];
  tasks: WorkspaceTask[];
  panel: PanelSection[];
  /** Exact position inside the project — the last thing worked on. */
  focus?: string;
  children: ReactNode;
  composer: ReactNode;
};



export function WorkspaceShell({
  roomName,
  roomKind,
  frassyRole,
  modes,
  activeModeId,
  onSelectMode,
  onOpenDaily,
  projects,
  activeProjectId,
  onSelectProject,
  roleLinks,
  index,
  onJumpTo,
  milestones,
  tasks,
  panel,
  focus,
  children,
  composer,
}: Props) {


  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [bright, setBright] = useState(true);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);


  const q = query.trim().toLowerCase();
  const searchHits = q
    ? [
        ...projects
          .filter((p) => p.name.toLowerCase().includes(q))
          .map((p) => ({ kind: "Project", label: p.name, go: () => onSelectProject(p.id) })),
        ...index
          .filter((e) => e.label.toLowerCase().includes(q))
          .map((e) => ({ kind: "Conversation", label: e.label, go: () => onJumpTo(e.id) })),
        ...tasks
          .filter((t) => t.label.toLowerCase().includes(q))
          .map((t) => ({ kind: "Task", label: t.label, go: () => onSelectProject(t.projectId) })),
        ...milestones
          .filter((m) => m.label.toLowerCase().includes(q))
          .map((m) => ({ kind: "Milestone", label: m.label, go: () => onSelectProject(m.projectId) })),
      ].slice(0, 8)
    : [];

  const groups = Array.from(new Set(index.map((e) => e.group)));
  const taskStates = Array.from(new Set(tasks.map((t) => t.state)));

  return (
    <div className={`frass-workspace ${bright ? "" : "ws-dark"} flex h-[100dvh] flex-col`}>
      {/* ── Top header ─────────────────────────────────────────────── */}
      <header className="ws-header">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" className="ws-icon" onClick={() => setLeftOpen((v) => !v)}
            aria-label={leftOpen ? "Collapse sidebar" : "Expand sidebar"}>
            {leftOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>
          <img src={symbolAsset.url} alt="" className="h-6 w-6 object-contain" />
          <div className="min-w-0">
            <div className="truncate text-[15px] font-semibold">{roomName}</div>
            <div className="ws-meta truncate">{roomKind} · Frassy is your {frassyRole}</div>
          </div>
        </div>

        <div className="relative mx-4 hidden max-w-md flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
          <input
            ref={searchRef}
            id="ws-global-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search everything — chats, projects, tasks, vendors, milestones…"
            className="ws-search"
          />

          {searchHits.length > 0 && (
            <div className="ws-search-pop">
              {searchHits.map((h, i) => (
                <button
                  key={`${h.kind}-${i}`}
                  type="button"
                  className="ws-search-hit"
                  onClick={() => {
                    h.go();
                    setQuery("");
                  }}
                >
                  <span className="ws-meta">{h.kind}</span>
                  <span className="flex-1 truncate text-left">{h.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button type="button" className="ws-icon" onClick={onOpenDaily} aria-label="Open The Frass Daily">
            <Sunrise className="h-4 w-4" />
          </button>
          <button type="button" className="ws-icon" onClick={() => setBright((v) => !v)}
            aria-label="Toggle workspace lighting">
            {bright ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link to="/" className="ws-icon" aria-label="Leave the workspace">
            <Home className="h-4 w-4" />
          </Link>
          <button type="button" className="ws-icon" onClick={() => setRightOpen((v) => !v)}
            aria-label={rightOpen ? "Collapse context panel" : "Expand context panel"}>
            {rightOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* ── Workspace memory bar — you always know exactly where you are ── */}
      <nav className="ws-memorybar" aria-label="Workspace position" data-blueprint="workspace-memory">
        <span className="ws-memorybar-root">My Workspace</span>
        <span aria-hidden>→</span>
        <button type="button" onClick={() => onSelectMode(activeModeId)}>
          {modes.find((m) => m.id === activeModeId)?.name ?? "Workspace"}
        </button>
        <span aria-hidden>→</span>
        <button type="button" onClick={() => onSelectProject(activeProjectId)}>
          {projects.find((p) => p.id === activeProjectId)?.name ?? roomName}
        </button>
        {focus && (
          <>
            <span aria-hidden>→</span>
            <span className="ws-memorybar-focus">{focus}</span>
          </>
        )}
      </nav>



      {/* ── Body ───────────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1">
        {/* Left sidebar — The Daily, modes, projects, index, timeline */}
        {leftOpen && (
          <aside className="ws-side hidden w-64 shrink-0 overflow-y-auto lg:block">
            {/* Permanent navigation — always available, adapts to permissions */}
            <div data-blueprint="workspace-navigation" className="ws-side-title">Navigation</div>
            <div className="space-y-0.5">
              <div className="ws-nav ws-nav-active">
                <Home className="h-4 w-4" />
                <span className="flex-1 text-left">My Workspace</span>
              </div>
              <button type="button" className="ws-nav" onClick={onOpenDaily}>
                <Sunrise className="h-4 w-4" />
                <span className="flex-1 text-left">The Daily</span>
              </button>
              <Link to="/studio" className="ws-nav">
                <span aria-hidden>🎬</span>
                <span className="flex-1 text-left">FV Studios</span>
              </Link>
              <Link to="/business-builder" className="ws-nav">
                <span aria-hidden>💼</span>
                <span className="flex-1 text-left">Business Builder</span>
              </Link>
              <Link to="/launch-accelerator" className="ws-nav">
                <span aria-hidden>🚀</span>
                <span className="flex-1 text-left">Launch Accelerator</span>
              </Link>
              <Link to="/first-30-days" className="ws-nav">
                <span aria-hidden>📅</span>
                <span className="flex-1 text-left">First 30 Days</span>
              </Link>
              <Link to="/money-moves" className="ws-nav">
                <span aria-hidden>💵</span>
                <span className="flex-1 text-left">Money Moves</span>
              </Link>
              <Link to="/journal" className="ws-nav">
                <span aria-hidden>📔</span>
                <span className="flex-1 text-left">Partner Journal</span>
              </Link>
              <Link to="/financial-center" className="ws-nav">
                <span aria-hidden>💰</span>
                <span className="flex-1 text-left">Financial Center</span>
              </Link>
              <Link to="/brand-partnerships" className="ws-nav">
                <span aria-hidden>🤝</span>
                <span className="flex-1 text-left">Brand Partnerships</span>
              </Link>


              <ForUsLink className="ws-nav">

                <span aria-hidden>❤️</span>
                <span className="flex-1 text-left">For Us</span>
              </ForUsLink>
              <button
                type="button"
                className="ws-nav"
                onClick={() => document.getElementById("ws-projects")?.scrollIntoView({ behavior: "smooth" })}
              >
                <FolderOpen className="h-4 w-4" />
                <span className="flex-1 text-left">Projects</span>
              </button>
              <Link to="/vault" className="ws-nav">
                <Archive className="h-4 w-4" />
                <span className="flex-1 text-left">Vault</span>
              </Link>
              <button type="button" className="ws-nav" onClick={() => searchRef.current?.focus()}>
                <Search className="h-4 w-4" />
                <span className="flex-1 text-left">Search</span>
              </button>
              {/* FRASS-0428A — there is no "profile" on Frass. It is your Frass Card. */}
              <Link to="/workspace/card" className="ws-nav">
                <User className="h-4 w-4" />
                <span className="flex-1 text-left">My Frass Card</span>
              </Link>
              {/* FRASS-0412 — temporary launch feedback program */}
              <div className="px-2 py-1">
                <VoiceFeedbackButton source="workspace" label="Voice Feedback" />
              </div>
              {roleLinks.map((r) => (
                <Link key={r.to} to={r.to} className="ws-nav ws-nav-role">
                  <span>{r.emoji}</span>
                  <span className="flex-1 truncate text-left">{r.label}</span>
                </Link>
              ))}
            </div>

            <div data-blueprint="workspace-modes" className="ws-side-title mt-5">Mode</div>
            <div className="space-y-0.5">

              {modes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onSelectMode(m.id)}
                  className={`ws-nav ${m.id === activeModeId ? "ws-nav-active" : ""}`}
                >
                  <span>{m.emoji}</span>
                  <span className="flex-1 truncate text-left">{m.name}</span>
                </button>
              ))}
            </div>

            <div id="ws-projects" data-blueprint="workspace-projects" className="ws-side-title mt-6">Projects</div>

            <div className="space-y-0.5">
              {projects.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectProject(p.id)}
                  className={`ws-nav ${p.id === activeProjectId ? "ws-nav-active" : ""}`}
                >
                  <span>{p.emoji}</span>
                  <span className="flex-1 truncate text-left">{p.name}</span>
                </button>
              ))}
            </div>

            <div className="ws-side-title mt-6">Conversation index</div>
            {groups.length === 0 && <p className="ws-meta px-2">Frassy builds this as you work.</p>}
            {groups.map((g) => (
              <div key={g} className="mb-3">
                <div className="ws-meta px-2 pb-1">{g}</div>
                {index
                  .filter((e) => e.group === g)
                  .map((e) => (
                    <button key={e.id} type="button" className="ws-nav" onClick={() => onJumpTo(e.id)}>
                      <span className="flex-1 truncate text-left">• {e.label}</span>
                    </button>
                  ))}
              </div>
            ))}

            <div className="ws-side-title mt-6">Workspace timeline</div>
            <div className="space-y-0.5 pb-8">
              {milestones.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="ws-nav"
                  onClick={() => onSelectProject(m.projectId)}
                >
                  <span>{m.icon}</span>
                  <span className="flex-1 truncate text-left">{m.label}</span>
                  <span className="ws-meta">{m.when}</span>
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* Main workspace */}
        <main className="flex min-w-0 flex-1 flex-col">
          <div data-blueprint="workspace-conversation" className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          {/* Persistent composer — never scrolls away */}
          <div data-blueprint="workspace-composer" className="ws-composer">{composer}</div>
        </main>

        {/* Right context panel */}
        {rightOpen && (
          <aside data-blueprint="workspace-panel" className="ws-side hidden w-72 shrink-0 overflow-y-auto xl:block">
            <div className="ws-side-title">Task panel</div>
            {taskStates.map((state) => (
              <div key={state} className="mb-4">
                <div className="ws-meta px-2 pb-1">{TASK_LABELS[state]}</div>
                {tasks
                  .filter((t) => t.state === state)
                  .map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className="ws-nav"
                      onClick={() => onSelectProject(t.projectId)}
                    >
                      <span className={`ws-dot ws-dot-${state}`} />
                      <span className="flex-1 text-left leading-snug">{t.label}</span>
                    </button>
                  ))}
              </div>
            ))}

            <div className="ws-side-title mt-4">Project tools</div>
            {panel.map((section) => (
              <div key={section.title} className="ws-panel-card">
                <div className="text-[13px] font-semibold">{section.title}</div>
                <ul className="mt-1.5 space-y-1">
                  {section.items.map((i) => (
                    <li key={i} className="ws-meta">{i}</li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="h-8" />
          </aside>
        )}
      </div>
    </div>
  );
}
