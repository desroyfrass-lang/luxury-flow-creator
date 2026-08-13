// FRASS-0522 — Frassy Voice Studio. One voice. One personality. One Frassy.
//
// The Founder listens to every candidate reading the identical script, tunes
// speed and warmth, teaches the pronunciation of brand words, and approves ONE
// voice. Approving retires the previous one in the same action, so the platform
// can never carry two Frassys.
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { useIsAdmin } from "@/hooks/use-is-admin";
import {
  CARIBBEAN_VOICE_PRINCIPLE,
  DEFAULT_PRONUNCIATION,
  TONE_DELIVERY,
  VOICE_CANDIDATES,
  VOICE_SAMPLE_SCRIPT,
  WARMTH_NOTES,
  type VoiceTone,
} from "@/lib/voice/frassy-voice";
import { approveOfficialVoice, listVoiceIdentities } from "@/lib/voice/voice.functions";

export const Route = createFileRoute("/_authenticated/admin/voice")({
  head: () => ({
    meta: [
      { title: "Frassy Voice Studio — Frass Founder Controls" },
      {
        name: "description",
        content:
          "Approve the single official Frassy voice: candidate auditions, speaking speed, warmth and the brand pronunciation dictionary.",
      },
      { property: "og:title", content: "Frassy Voice Studio — Frass Founder Controls" },
      {
        property: "og:description",
        content: "One voice, one personality, one Frassy across every district of Frass Hill.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: VoiceStudioPage,
});

const TONES = Object.keys(TONE_DELIVERY) as VoiceTone[];

function VoiceStudioPage() {
  const isAdmin = useIsAdmin();
  const list = useServerFn(listVoiceIdentities);
  const approve = useServerFn(approveOfficialVoice);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["voice-identities"],
    queryFn: () => list(),
    enabled: isAdmin,
  });

  const official = data?.find((v) => v.status === "official");

  const [voiceId, setVoiceId] = useState("shimmer");
  const [speed, setSpeed] = useState(1);
  const [warmth, setWarmth] = useState(3);
  const [tone, setTone] = useState<VoiceTone>("welcome");
  const [script, setScript] = useState(VOICE_SAMPLE_SCRIPT);
  const [dict, setDict] = useState<Record<string, string>>(DEFAULT_PRONUNCIATION);
  const [note, setNote] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!official) return;
    setVoiceId(official.voiceId);
    setSpeed(official.speed);
    setWarmth(official.warmth);
    if (Object.keys(official.pronunciation).length) setDict(official.pronunciation);
  }, [official?.id]);

  useEffect(() => () => audioRef.current?.pause(), []);

  async function audition(candidate: string) {
    audioRef.current?.pause();
    setPlaying(candidate);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: script.slice(0, 2000),
          tone,
          preview: true,
          voice: candidate,
          speed,
          warmth,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const url = URL.createObjectURL(await res.blob());
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setPlaying(null);
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch (err) {
      setPlaying(null);
      toast.error(err instanceof Error ? err.message : "Could not play that audition.");
    }
  }

  const approveMutation = useMutation({
    mutationFn: () =>
      approve({
        data: {
          voiceId,
          speed,
          warmth,
          pronunciation: Object.fromEntries(
            Object.entries(dict).filter(([k, v]) => k.trim() && v.trim()),
          ),
          note: note.trim() || null,
        },
      }),
    onSuccess: () => {
      toast.success("Approved. This is Frassy's voice everywhere in Frass, from now on.");
      setNote("");
      void qc.invalidateQueries({ queryKey: ["voice-identities"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not approve that voice."),
  });

  if (isAdmin && isLoading) {
    return (
      <SiteShell>
        <p className="p-10 text-sm text-muted-foreground">Loading the Voice Studio…</p>
      </SiteShell>
    );
  }
  if (!isAdmin) {
    return (
      <SiteShell>
        <p className="p-10 text-sm text-muted-foreground">
          Only the Founder can change Frassy's voice.
        </p>
      </SiteShell>
    );
  }

  const dirty =
    !official ||
    official.voiceId !== voiceId ||
    official.speed !== speed ||
    official.warmth !== warmth ||
    JSON.stringify(official.pronunciation) !== JSON.stringify(dict);

  return (
    <SiteShell>
      <div className="mx-auto max-w-4xl space-y-10 px-5 py-12">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">FRASS-0522</p>
          <h1 className="text-3xl font-black uppercase tracking-tight">Frassy Voice Studio</h1>
          <p className="text-sm text-muted-foreground">
            One voice. One personality. One Frassy. Whatever you approve here is the voice a member
            hears in the Daily, in a Workshop, in a Money Move, inside a Business Vault and on the
            very first hello. Her feeling changes with the moment; who she is never does.
          </p>
          <p className="rounded-lg border border-border/60 bg-muted/30 p-4 text-xs leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">
              What this means in plain English:
            </span>{" "}
            Frassy is one person, not a set of robot voices. Think of hiring a single host for your
            whole hotel instead of a different greeter behind every door — guests recognise her
            instantly, wherever they wander.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider">Current official voice</h2>
          {official ? (
            <div className="rounded-xl border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/5 p-5 text-sm">
              <p className="font-semibold capitalize">{official.voiceId}</p>
              <p className="text-muted-foreground">
                Speed {official.speed.toFixed(2)}× · Warmth {official.warmth}/5 ·{" "}
                {Object.keys(official.pronunciation).length} pronunciation rules
              </p>
              {official.note ? (
                <p className="mt-2 italic text-muted-foreground">“{official.note}”</p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No voice approved yet — Frassy is using the safe default until you choose.
            </p>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider">The audition script</h2>
          <p className="text-xs text-muted-foreground">
            Every candidate reads the same words, so you are comparing voices, not sentences.
          </p>
          <textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-border bg-background p-3 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`rounded-full border px-3 py-1 text-xs capitalize transition ${
                  tone === t
                    ? "border-[color:var(--gold)] text-[color:var(--gold)]"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="text-xs italic text-muted-foreground">{TONE_DELIVERY[tone]}</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider">Candidates</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {VOICE_CANDIDATES.map((c) => (
              <div
                key={c.id}
                className={`rounded-xl border p-4 transition ${
                  voiceId === c.id ? "border-[color:var(--gold)]" : "border-border"
                }`}
              >
                <p className="font-semibold">{c.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.character}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => void audition(c.id)}
                    disabled={playing === c.id}
                    className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted disabled:opacity-50"
                  >
                    {playing === c.id ? "Playing…" : "Listen"}
                  </button>
                  <button
                    onClick={() => setVoiceId(c.id)}
                    className="rounded-full border border-[color:var(--gold)]/60 px-3 py-1 text-xs text-[color:var(--gold)]"
                  >
                    {voiceId === c.id ? "Selected" : "Select"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Speaking speed — {speed.toFixed(2)}×</label>
            <input
              type="range"
              min={0.8}
              max={1.2}
              step={0.01}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Unhurried enough to feel human, quick enough to respect the member's time.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Warmth — {warmth}/5</label>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={warmth}
              onChange={(e) => setWarmth(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">{WARMTH_NOTES[warmth]}</p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider">
            Brand pronunciation dictionary
          </h2>
          <p className="text-xs text-muted-foreground">
            Teach her to say the Frass words the same way every single time. The member still reads
            the normal spelling — this only changes what the speech engine hears.
          </p>
          <div className="space-y-2">
            {Object.entries(dict).map(([term, spoken]) => (
              <div key={term} className="flex items-center gap-2">
                <span className="w-40 shrink-0 text-sm">{term}</span>
                <input
                  value={spoken}
                  onChange={(e) => setDict({ ...dict, [term]: e.target.value })}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                />
                <button
                  onClick={() => {
                    const next = { ...dict };
                    delete next[term];
                    setDict(next);
                  }}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <AddPronunciation onAdd={(term, spoken) => setDict({ ...dict, [term]: spoken })} />
        </section>

        <section className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider">Cultural principle</h2>
          <p className="text-xs leading-relaxed text-muted-foreground">{CARIBBEAN_VOICE_PRINCIPLE}</p>
        </section>

        <section className="space-y-3">
          <label className="text-sm font-semibold">Why this voice (optional note)</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Warmest of the six, never tiring over a long Daily."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            onClick={() => approveMutation.mutate()}
            disabled={!dirty || approveMutation.isPending}
            className="rounded-full bg-[color:var(--gold)] px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-black disabled:opacity-40"
          >
            {approveMutation.isPending ? "Approving…" : "Approve as the official Frassy voice"}
          </button>
          <p className="text-xs text-muted-foreground">
            Approving replaces the current voice everywhere at once and retires the old one. There
            is never more than one Frassy.
          </p>
        </section>

        {data && data.length > 1 ? (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider">Voice history</h2>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {data
                .filter((v) => v.status !== "official")
                .map((v) => (
                  <li key={v.id} className="rounded-lg border border-border/50 p-3">
                    <span className="capitalize text-foreground">{v.voiceId}</span> · {v.status} ·{" "}
                    {new Date(v.createdAt).toLocaleDateString()}
                    {v.note ? ` · “${v.note}”` : ""}
                  </li>
                ))}
            </ul>
          </section>
        ) : null}
      </div>
    </SiteShell>
  );
}

function AddPronunciation({ onAdd }: { onAdd: (term: string, spoken: string) => void }) {
  const [term, setTerm] = useState("");
  const [spoken, setSpoken] = useState("");
  return (
    <div className="flex items-center gap-2">
      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="Written word"
        className="w-40 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
      />
      <input
        value={spoken}
        onChange={(e) => setSpoken(e.target.value)}
        placeholder="How she should say it"
        className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
      />
      <button
        onClick={() => {
          if (!term.trim() || !spoken.trim()) return;
          onAdd(term.trim(), spoken.trim());
          setTerm("");
          setSpoken("");
        }}
        className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted"
      >
        Add
      </button>
    </div>
  );
}
