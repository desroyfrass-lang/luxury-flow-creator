// FRASS-0601 — the Script workspace. One section changes without touching the rest.
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { GoldButton, QuietButton, StudioCard, inputClass } from "@/components/studios/studio-ui";
import { generateScript, reviseScriptSection } from "@/lib/studios/production-engine.functions";
import { useScript, useScriptVersions } from "@/lib/studios/use-engine";
import { logStudioActivity } from "@/lib/studios/use-studios";

const MODES = [
  { id: "rewrite", label: "Rewrite" },
  { id: "shorten", label: "Shorten" },
  { id: "expand", label: "Expand" },
  { id: "funnier", label: "Funnier" },
  { id: "warmer", label: "Warmer" },
  { id: "simpler", label: "Simpler" },
];

export function ScriptPanel({ production, developmentReady }: { production: any; developmentReady: boolean }) {
  const qc = useQueryClient();
  const { data: script } = useScript(production.id);
  const { data: versions = [] } = useScriptVersions(script?.id);
  const write = useServerFn(generateScript);
  const revise = useServerFn(reviseScriptSection);
  const [busy, setBusy] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("");
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [sectionNote, setSectionNote] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const sections: any[] = (script?.sections as any[]) ?? [];

  const run = async () => {
    setBusy("write");
    try {
      await write({ data: { productionId: production.id, instruction } });
      setInstruction("");
      qc.invalidateQueries({ queryKey: ["studio"] });
      toast.success("Frassy wrote the script.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Frassy couldn't write that.");
    } finally {
      setBusy(null);
    }
  };

  const runSection = async (sectionId: string, mode: string) => {
    setBusy(`${sectionId}:${mode}`);
    try {
      const res = await revise({ data: { productionId: production.id, sectionId, mode, instruction: sectionNote } });
      setSectionNote("");
      qc.invalidateQueries({ queryKey: ["studio", "script", production.id] });
      qc.invalidateQueries({ queryKey: ["studio", "script-versions"] });
      toast.success(String(res.note ?? "Section rewritten. Everything else untouched."));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Frassy couldn't rewrite that section.");
    } finally {
      setBusy(null);
    }
  };

  const approve = async () => {
    if (!script) return;
    await supabase.from("studio_scripts").update({ status: "approved", approved_at: new Date().toISOString() }).eq("id", script.id);
    await logStudioActivity("script_approved", "production", production.id);
    qc.invalidateQueries({ queryKey: ["studio", "script", production.id] });
    toast.success("Script approved. Frassy can break it into scenes.");
  };

  const restore = async (version: any) => {
    if (!script) return;
    await supabase.from("studio_script_versions").insert({
      script_id: script.id,
      production_id: production.id,
      version: script.version,
      body: script.body,
      sections: script.sections,
      change_note: `Replaced by restoring v${version.version}`,
    });
    await supabase
      .from("studio_scripts")
      .update({ body: version.body, sections: version.sections, version: (script.version ?? 1) + 1, status: "draft" })
      .eq("id", script.id);
    qc.invalidateQueries({ queryKey: ["studio", "script", production.id] });
    toast.success(`Restored version ${version.version}.`);
  };

  return (
    <div className="space-y-5">
      <StudioCard eyebrow="Step 4 — the words" title="Script">
        {!developmentReady ? (
          <p className="text-sm text-muted-foreground">Approve the story first. Frassy writes from the agreed story, not from scratch.</p>
        ) : (
          <>
            <textarea
              rows={2}
              className={inputClass}
              placeholder="Anything about tone, length or a line you want in there?"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <GoldButton onClick={run} disabled={busy !== null}>
                {busy === "write" ? "Frassy is writing…" : script ? "Write a fresh draft" : "Write the script"}
              </GoldButton>
              {script ? (
                <QuietButton onClick={approve} disabled={script.status === "approved"}>
                  {script.status === "approved" ? "Script approved ✓" : "Approve the script"}
                </QuietButton>
              ) : null}
              {versions.length ? (
                <QuietButton onClick={() => setShowHistory((v) => !v)}>
                  {showHistory ? "Hide history" : `History (${versions.length})`}
                </QuietButton>
              ) : null}
            </div>
            {script ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Version {script.version} · {script.word_count} words · a rewrite of one part never destroys the rest.
              </p>
            ) : null}
          </>
        )}
      </StudioCard>

      {showHistory && versions.length ? (
        <StudioCard eyebrow="Nothing is ever lost" title="Version history">
          <ul className="space-y-2 text-sm">
            {versions.map((v: any) => (
              <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
                <span>
                  <span className="text-[color:var(--gold)]">v{v.version}</span> — {v.change_note ?? "Saved"}{" "}
                  <span className="text-muted-foreground">({new Date(v.created_at).toLocaleString()})</span>
                </span>
                <QuietButton onClick={() => restore(v)}>Restore</QuietButton>
              </li>
            ))}
          </ul>
        </StudioCard>
      ) : null}

      {sections.map((s) => {
        const open = openSection === s.id;
        return (
          <div key={s.id} className="rounded-lg border border-border/70 bg-card/60 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)]">{s.id}</div>
                <h3 className="font-display text-lg uppercase tracking-tight">{s.heading}</h3>
                {s.summary ? <p className="mt-1 text-sm text-muted-foreground">{s.summary}</p> : null}
              </div>
              <QuietButton onClick={() => setOpenSection(open ? null : s.id)}>{open ? "Close" : "Change this part"}</QuietButton>
            </div>

            {s.action ? <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">{s.action}</p> : null}

            {(s.lines ?? []).length ? (
              <div className="mt-4 space-y-3">
                {s.lines.map((l: any, i: number) => (
                  <div key={i} className="border-l-2 border-[color:var(--gold)]/40 pl-3">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-[color:var(--gold)]">
                      {l.character}
                      {l.type === "narration" ? " (narration)" : ""}
                      {l.direction ? ` — ${l.direction}` : ""}
                    </div>
                    <p className="text-sm">{l.text}</p>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
              {s.camera ? <span>🎥 {s.camera}</span> : null}
              {s.animation ? <span>🌀 {s.animation}</span> : null}
              {s.music ? <span>🎵 {s.music}</span> : null}
              {s.sfx ? <span>🔊 {s.sfx}</span> : null}
            </div>

            {open ? (
              <div className="mt-4 rounded-sm border border-border/60 bg-background/40 p-3">
                <input
                  className={inputClass}
                  placeholder="Optional: say exactly what you want changed here"
                  value={sectionNote}
                  onChange={(e) => setSectionNote(e.target.value)}
                />
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => runSection(s.id, m.id)}
                      disabled={busy !== null}
                      className="rounded-sm border border-border/70 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold)] disabled:opacity-40"
                    >
                      {busy === `${s.id}:${m.id}` ? "Working…" : m.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">Only this part changes. Every other part stays exactly as it is.</p>
              </div>
            ) : null}
          </div>
        );
      })}

      {script && !sections.length ? (
        <StudioCard title="Script">
          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{script.body}</pre>
        </StudioCard>
      ) : null}
    </div>
  );
}
