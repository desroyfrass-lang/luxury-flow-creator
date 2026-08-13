// FRASS-0522-A — the person behind the voice, on display.
import {
  FRASSY_ALWAYS,
  FRASSY_NEVER,
  FRASSY_COMMUNICATION_STYLE,
} from "@/lib/frassy/brand-personality";

export function BrandPersonalityPanel() {
  return (
    <section className="rounded-2xl border border-border/70 p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-[color:var(--gold)]">FRASS-0522-A</p>
      <h2 className="mt-1 text-xl font-black uppercase tracking-tight">Brand Personality Guide</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        The voice gives Frassy a consistent sound. This gives her a consistent character. These
        traits are constitutional — they apply in every district, in text and in voice, and they
        are part of the instructions she receives before she says a single word.
      </p>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold">Frassy always is</h3>
          <ul className="mt-2 space-y-2">
            {FRASSY_ALWAYS.map((t) => (
              <li key={t.trait} className="text-xs">
                <span className="text-[color:var(--gold)]">✓ {t.trait}</span>
                <span className="block text-muted-foreground">{t.plain}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Frassy never is</h3>
          <ul className="mt-2 space-y-2">
            {FRASSY_NEVER.map((t) => (
              <li key={t.trait} className="text-xs">
                <span className="text-muted-foreground">✕ {t.trait}</span>
                <span className="block text-muted-foreground/70">{t.plain}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 border-t border-border/60 pt-3">
        <h3 className="text-sm font-semibold">Communication style</h3>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {FRASSY_COMMUNICATION_STYLE.map((s) => (
            <li key={s} className="text-xs text-muted-foreground">
              · {s}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
