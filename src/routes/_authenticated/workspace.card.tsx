import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PageFeedback } from "@/components/page-feedback";
import { getMyProfile } from "@/lib/profiles.functions";
import { getMyCard, getMyCardAnalytics, updateMyCard } from "@/lib/card.functions";
import type { BusinessCard } from "@/lib/card.functions";
import {
  CARD_ACCENTS,
  CARD_EVENT_LABELS,
  CARD_EVENT_ORDER,
  CARD_PRINCIPLE,
  CARD_SECTIONS,
  CARD_THEMES,
  cardPath,
} from "@/lib/card";
import { ShareCardButton } from "@/components/card/card-share";

export const Route = createFileRoute("/_authenticated/workspace/card")({
  head: () => ({
    meta: [
      { title: "Living Business Card — Frass OS" },
      {
        name: "description",
        content:
          "Customise and share your Frass Living Business Card: hero media, theme, links, QR code and performance analytics.",
      },
      { property: "og:title", content: "Living Business Card — Frass OS" },
      {
        property: "og:description",
        content: "Your always-current digital handshake, ready to share anywhere.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CardStudio,
});

const panel = "rounded-2xl border border-border/60 bg-background/60 p-6 backdrop-blur";
const heading = "text-xs uppercase tracking-[0.25em] text-muted-foreground";

function CardStudio() {
  const queryClient = useQueryClient();
  const profileFn = useServerFn(getMyProfile);
  const cardFn = useServerFn(getMyCard);
  const saveFn = useServerFn(updateMyCard);
  const analyticsFn = useServerFn(getMyCardAnalytics);

  const { data: profile } = useQuery({ queryKey: ["my-profile"], queryFn: () => profileFn() });
  const { data: card } = useQuery({ queryKey: ["my-business-card"], queryFn: () => cardFn() });
  const { data: analytics } = useQuery({ queryKey: ["my-card-analytics"], queryFn: () => analyticsFn() });

  const [form, setForm] = useState<Partial<BusinessCard>>({});
  useEffect(() => {
    if (card) setForm(card);
  }, [card]);

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof saveFn>[0]["data"]) => saveFn({ data: payload }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["my-business-card"], updated);
      toast.success("Card updated. Everyone holding your link sees it immediately.");
    },
    onError: (err: Error) => toast.error(err.message || "Could not save your card."),
  });

  const set = <K extends keyof BusinessCard>(key: K, value: BusinessCard[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handle = profile?.handle ?? null;
  const name = profile?.display_name ?? profile?.full_name ?? "Your card";

  const save = () =>
    mutation.mutate({
      headline: form.headline ?? null,
      job_title: form.job_title ?? null,
      company: form.company ?? null,
      hero_media_url: form.hero_media_url ?? null,
      background_url: form.background_url ?? null,
      theme: (form.theme as "midnight") ?? "midnight",
      accent: (form.accent as "gold") ?? "gold",
      cta_label: form.cta_label ?? null,
      cta_url: form.cta_url ?? null,
      website: form.website ?? null,
      booking_url: form.booking_url ?? null,
      business_hours: form.business_hours ?? null,
      location: form.location ?? null,
      languages: form.languages ?? [],
      certifications: form.certifications ?? [],
      section_order: form.section_order ?? CARD_SECTIONS.map((s) => s.id),
      is_published: form.is_published ?? true,
      show_contact: form.show_contact ?? true,
    });

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-12">
      <header className="space-y-3">
        <p className={heading}>FRASS-0426 · Universal Digital Identity</p>
        <h1 className="text-3xl font-black uppercase tracking-tight">Living Business Card</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">{CARD_PRINCIPLE}</p>
        <p className="max-w-2xl text-sm text-muted-foreground">
          <strong>What this means in plain English:</strong> this is a business card that updates itself.
          Print the QR on a box today, change your phone number next year, and the box still works — like a
          house number that stays put while you redecorate inside.
        </p>
        {handle ? (
          <div className="flex flex-wrap items-center gap-3">
            <code className="rounded-md border border-border/60 px-2 py-1 text-xs">
              frasskicks.com{cardPath(handle)}
            </code>
            <ShareCardButton handle={handle} name={name} />
            <a className="ws-chip" href={cardPath(handle)} target="_blank" rel="noreferrer">
              Open my card
            </a>
          </div>
        ) : (
          <p className="text-sm text-amber-500">
            Set a handle under Builder Identity in your profile to switch on your permanent card link.
          </p>
        )}
      </header>

      <section className={panel}>
        <h2 className={heading}>Identity</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Headline" value={form.headline} onChange={(v) => set("headline", v)} placeholder="Builder, founder, creator" />
          <Field label="Job title" value={form.job_title} onChange={(v) => set("job_title", v)} />
          <Field label="Business name" value={form.company} onChange={(v) => set("company", v)} />
          <Field label="Website" value={form.website} onChange={(v) => set("website", v)} placeholder="https://" />
          <Field label="Booking link" value={form.booking_url} onChange={(v) => set("booking_url", v)} placeholder="https://" />
          <Field label="Location (optional)" value={form.location} onChange={(v) => set("location", v)} />
          <Field label="Business hours (optional)" value={form.business_hours} onChange={(v) => set("business_hours", v)} />
          <Field label="Hero video or image URL" value={form.hero_media_url} onChange={(v) => set("hero_media_url", v)} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <ListField
            label="Languages spoken"
            values={form.languages ?? []}
            onChange={(v) => set("languages", v)}
          />
          <ListField
            label="Certifications"
            values={form.certifications ?? []}
            onChange={(v) => set("certifications", v)}
          />
        </div>
        <div className="mt-4 space-y-2">
          <Label className="text-xs">Call to action</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input value={form.cta_label ?? ""} placeholder="Work with me" onChange={(e) => set("cta_label", e.target.value)} />
            <Input value={form.cta_url ?? ""} placeholder="https://" onChange={(e) => set("cta_url", e.target.value)} />
          </div>
        </div>
      </section>

      <section className={panel}>
        <h2 className={heading}>Presentation</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The card stays recognisably Frass while carrying your personality.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {Object.entries(CARD_THEMES).map(([id, t]) => (
            <button
              key={id}
              type="button"
              onClick={() => set("theme", id)}
              className={`rounded-xl border p-3 text-left text-sm transition ${
                (form.theme ?? "midnight") === id ? "border-primary" : "border-border/60"
              }`}
              style={{ background: t.wash, color: t.ink }}
            >
              <span className="font-semibold">{t.label}</span>
              <span className="mt-1 block text-[11px] opacity-70">{t.note}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {Object.entries(CARD_ACCENTS).map(([id, value]) => (
            <button
              key={id}
              type="button"
              aria-label={`Accent ${id}`}
              onClick={() => set("accent", id)}
              className={`h-9 w-9 rounded-full border-2 transition ${
                (form.accent ?? "gold") === id ? "border-foreground scale-110" : "border-transparent"
              }`}
              style={{ background: value }}
            />
          ))}
        </div>
        <Field
          className="mt-4"
          label="Background image URL (optional)"
          value={form.background_url}
          onChange={(v) => set("background_url", v)}
        />
        <div className="mt-5 space-y-3">
          <Toggle
            label="Card is live"
            hint="Turn off to take your card offline without deleting anything."
            checked={form.is_published ?? true}
            onChange={(v) => set("is_published", v)}
          />
          <Toggle
            label="Show contact section"
            hint="Hides email and phone from visitors while keeping your links visible."
            checked={form.show_contact ?? true}
            onChange={(v) => set("show_contact", v)}
          />
        </div>
      </section>

      <div className="flex gap-3">
        <Button onClick={save} disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Save card"}
        </Button>
      </div>

      <section className={panel} id="analytics">
        <h2 className={heading}>Analytics · last 90 days</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Everything is measurable. Zeros are shown honestly — no invented activity.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {CARD_EVENT_ORDER.map((kind) => (
            <div key={kind} className="rounded-xl border border-border/60 p-4">
              <span className="text-2xl font-black">{analytics?.totals?.[kind] ?? 0}</span>
              <p className="mt-1 text-xs text-muted-foreground">{CARD_EVENT_LABELS[kind]}</p>
            </div>
          ))}
        </div>
      </section>

      <PageFeedback pageTitle="Living Business Card" />
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value?: string | null;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label className="text-xs">{label}</Label>
      <Input value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function ListField({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label} (one per line)</Label>
      <Textarea
        rows={3}
        value={values.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
      />
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border/60 p-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
