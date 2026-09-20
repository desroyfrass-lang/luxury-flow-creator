// ─────────────────────────────────────────────────────────────────────────────
// FRASS-0406 — Phone Content Mode™ panel inside Frass Vision Studios (FV Studios).
// Detect → offer → preset → Quality Report → approve → Learning Mode.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from "react";
import { Smartphone, Sparkles, Info, Clock, Gauge } from "lucide-react";
import {
  ENHANCEMENTS,
  MOBILE_FIRST_ENVIRONMENTS,
  PRESETS,
  PRESET_STORAGE_KEY,
  buildQualityReport,
  detectPhoneMedia,
  probeFile,
  readPreference,
  writePreference,
  type Detection,
  type MediaProbe,
  type PhoneModePreference,
  type QualityReport,
} from "@/lib/studio/phone-content-mode";
import { formatDuration, unitLabel, usdFor } from "@/lib/studio/credits";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Props = {
  balance: number;
  running: boolean;
  onRun: (report: QualityReport, file: File) => void;
};

export function PhoneContentMode({ balance, running, onRun }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preference, setPreference] = useState<PhoneModePreference>("ask");
  const [probe, setProbe] = useState<MediaProbe | null>(null);
  const [detection, setDetection] = useState<Detection | null>(null);
  const [engaged, setEngaged] = useState(false);
  const [presetKey, setPresetKey] = useState("social");
  const [includeUpscale, setIncludeUpscale] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [learning, setLearning] = useState(false);
  const [sourceFile, setSourceFile] = useState<File | null>(null);

  useEffect(() => {
    setPreference(readPreference());
    const saved = window.localStorage.getItem(PRESET_STORAGE_KEY);
    if (saved) setPresetKey(saved);
  }, []);

  const setPref = (value: PhoneModePreference) => {
    setPreference(value);
    writePreference(value);
    if (value === "off") setEngaged(false);
  };

  const choosePreset = (key: string) => {
    setPresetKey(key);
    window.localStorage.setItem(PRESET_STORAGE_KEY, key);
  };

  const onPick = async (file: File) => {
    setAnalysing(true);
    setLearning(false);
    try {
      const p = await probeFile(file);
      setSourceFile(file);
      const d = detectPhoneMedia(p);
      setProbe(p);
      setDetection(d);
      setEngaged(preference === "always" && d.isLikelyPhone);
    } finally {
      setAnalysing(false);
    }
  };

  const report = useMemo(
    () =>
      detection && engaged
        ? buildQualityReport(detection, presetKey, probe?.durationSeconds ?? 0, {
            includeUpscale,
          })
        : null,
    [detection, engaged, presetKey, probe, includeUpscale],
  );

  const affordable = report ? balance >= report.forecast.total : true;

  return (
    <section className="rounded-2xl border border-accent/30 bg-card/80 p-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-accent">FRASS-0406</p>
          <h2 className="mt-1 flex items-center gap-2 text-lg font-light tracking-wide">
            <Smartphone className="h-5 w-5 text-accent" /> Phone Content Mode™
          </h2>
          <p className="mt-1 max-w-xl text-xs text-muted-foreground">
            Creativity should never be limited by equipment. Drop in a phone recording and Frassy
            lifts it to studio standard — while keeping your own style intact.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">When detected</p>
          <div className="mt-1 flex gap-1">
            {(
              [
                ["always", "Always enable"],
                ["ask", "Ask every time"],
                ["off", "Disabled"],
              ] as Array<[PhoneModePreference, string]>
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setPref(value)}
                className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-widest transition ${
                  preference === value
                    ? "border-accent/60 bg-accent/20 text-accent"
                    : "border-border text-muted-foreground hover:border-accent/50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Analyse */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          onClick={() => inputRef.current?.click()}
          className="rounded-xl border border-accent/50 bg-accent/15 px-4 py-2 text-xs uppercase tracking-widest text-accent hover:bg-accent/25"
        >
          {analysing ? "Analysing…" : "Analyse a recording"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="audio/wav,audio/x-wav,audio/mpeg,audio/mp4,audio/webm,audio/ogg,video/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onPick(f);
          }}
        />
        <p className="text-[11px] text-muted-foreground">
          Nothing is uploaded to analyse — the read happens on your device, and nothing is charged
          until you approve.
        </p>
      </div>

      <Dialog
        open={Boolean(detection && probe)}
        onOpenChange={(o) => {
          if (!o) {
            setDetection(null);
            setProbe(null);
            setEngaged(false);
          }
        }}
      >
        <DialogContent className="fv-studio-surface max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>What Frassy found in your recording</DialogTitle>
          </DialogHeader>
        {detection && probe && (
        <div className="space-y-4">
          {/* Detection */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-foreground">
              {detection.isLikelyPhone
                ? "I detected this was likely recorded on a mobile device. Would you like me to activate Phone Content Mode™?"
                : "This doesn't read as a phone recording, but you can still run the enhancement chain if you want it."}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
              {detection.confidence}% confidence · {detection.resolutionLabel} ·{" "}
              {detection.orientation}
              {probe.durationSeconds > 0 && ` · ${formatDuration(probe.durationSeconds)}`}
            </p>
            <ul className="mt-3 grid gap-1 sm:grid-cols-2">
              {detection.signals.map((s) => (
                <li key={s.label} className="text-[11px] text-muted-foreground">
                  <span className="text-foreground">{s.label}</span> — {s.detail}
                </li>
              ))}
              {detection.signals.length === 0 && (
                <li className="text-[11px] text-muted-foreground">No mobile fingerprints in this file.</li>
              )}
            </ul>
            {!engaged && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setEngaged(true)}
                  className="rounded-lg bg-accent px-4 py-2 text-[11px] font-medium uppercase tracking-widest text-accent-foreground"
                >
                  Enable Phone Content Mode
                </button>
                <button
                  onClick={() => {
                    setDetection(null);
                    setProbe(null);
                  }}
                  className="rounded-lg border border-border px-4 py-2 text-[11px] uppercase tracking-widest text-muted-foreground"
                >
                  Not this time
                </button>
              </div>
            )}
          </div>

          {engaged && (
            <>
              {/* Presets */}
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Creator preset
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => choosePreset(p.key)}
                      className={`rounded-full border px-3 py-1.5 text-[11px] transition ${
                        presetKey === p.key
                          ? "border-accent/60 bg-accent/20 text-accent"
                          : "border-border text-muted-foreground hover:border-accent/50"
                      }`}
                    >
                      <span className="mr-1">{p.icon}</span>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {report && (
                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                    <Gauge className="h-3.5 w-3.5" /> AI Quality Report
                  </h3>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <ScoreBar label="Current quality" value={report.detection.currentScore} />
                    <ScoreBar
                      label="Potential quality"
                      value={report.detection.potentialScore}
                      good
                    />
                  </div>

                  <p className="mt-3 text-xs text-foreground">{report.summary}</p>

                  {report.detection.issues.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {report.detection.issues.map((i) => (
                        <li key={i} className="text-[11px] text-muted-foreground">
                          • {i}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-4 space-y-1.5">
                    {report.forecast.lines.map((l) => (
                      <div
                        key={l.key}
                        className="flex items-baseline justify-between gap-3 border-b border-border pb-1.5"
                      >
                        <span className="text-xs text-foreground">
                          {l.label}{" "}
                          <span className="text-muted-foreground">· {unitLabel(l.unit, l.qty)}</span>
                        </span>
                        <span className="text-xs tabular-nums text-accent">
                          {l.credits.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      About {formatDuration(report.forecast.seconds)} of processing
                    </span>
                    <span className="text-foreground">
                      {report.forecast.total.toLocaleString()} AI Credits
                      <span className="ml-2 text-muted-foreground">
                        ≈ {usdFor(report.forecast.total)} of compute
                      </span>
                    </span>
                  </div>

                  <label className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={includeUpscale}
                      onChange={(e) => setIncludeUpscale(e.target.checked)}
                    />
                    Include resolution enhancement (costs the most — worth it for big screens)
                  </label>

                  {report.deferred.length > 0 && (
                    <p className="mt-3 text-[11px] text-muted-foreground">
                      Marked as future capability, so not charged today:{" "}
                      {report.deferred.map((d) => d.label).join(", ")}.
                    </p>
                  )}

                  <p className="mt-3 text-xs text-muted-foreground">
                    Improve a recording made on your phone — reduce unwanted noise, improve clarity,
                    and prepare it for production. The result is cleaned and restored, not mastered.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      disabled={running || !affordable || !sourceFile || !sourceFile.type.startsWith("audio/")}
                      onClick={() => {
                        if (sourceFile) onRun(report, sourceFile);
                        setLearning(true);
                        setDetection(null);
                        setProbe(null);
                        setEngaged(false);
                      }}
                      className="rounded-lg bg-accent px-4 py-2 text-[11px] font-medium uppercase tracking-widest text-accent-foreground disabled:opacity-40"
                    >
                      {sourceFile && !sourceFile.type.startsWith("audio/")
                        ? "Enhance Phone Recording currently accepts audio files"
                        : affordable
                        ? "Enhance Phone Recording"
                        : "Not enough credits"}
                    </button>
                    <button
                      onClick={() => setLearning((v) => !v)}
                      className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-[11px] uppercase tracking-widest text-muted-foreground"
                    >
                      <Info className="h-3.5 w-3.5" /> Why?
                    </button>
                  </div>

                  {learning && (
                    <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-3">
                      <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5" /> Learning Mode
                      </p>
                      <ul className="mt-2 space-y-1.5">
                        {report.explanation.map((e) => (
                          <li key={e} className="text-[11px] leading-relaxed text-muted-foreground">
                            {e}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        Your performance is never altered — only what sits in front of it.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        )}
        </DialogContent>
      </Dialog>

      <footer className="mt-5 border-t border-border pt-4">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Tuned for real recording conditions
        </p>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {MOBILE_FIRST_ENVIRONMENTS.join(" · ")}
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground">
          {ENHANCEMENTS.filter((e) => e.availability === "live").length} enhancements available
          today ·{" "}
          {ENHANCEMENTS.filter((e) => e.availability === "future").length} reserved for future
          providers. The pipeline is modular — new capabilities slot in without rebuilding the
          Studio.
        </p>
      </footer>
    </section>
  );
}

function ScoreBar({ label, value, good }: { label: string; value: number; good?: boolean }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</span>
        <span className={`text-sm tabular-nums ${good ? "text-accent" : "text-foreground"}`}>
          {value}/100
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full ${good ? "bg-accent" : "bg-muted-foreground"}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
