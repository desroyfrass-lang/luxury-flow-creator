import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PenLine, Save, X } from "lucide-react";
import { updateMyProfile } from "@/lib/profiles.functions";
import {
  aboutIsEmpty,
  linkLinesToText,
  parseAbout,
  parseLinkLines,
  parseTags,
  type BuilderAbout,
} from "@/lib/about";

/**
 * FRASS-0423 §5/§6 — the About section of FOR ME as a Living Biography.
 *
 * Separate from posts, stories and activity. This is the member's permanent
 * introduction, and it stays editable forever.
 */
export function ForMeAbout({ raw, canEdit }: { raw: unknown; canEdit: boolean }) {
  const stored = useMemo(() => parseAbout(raw), [raw]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<BuilderAbout>(stored);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const save = useServerFn(updateMyProfile);

  useEffect(() => setDraft(stored), [stored]);

  const mutation = useMutation({
    mutationFn: (about: BuilderAbout) => save({ data: { about } }),
    onSuccess: () => {
      setEditing(false);
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: () => setError("Could not save your About page. Try again in a moment."),
  });

  if (editing) {
    return (
      <form
        className="mt-6 grid gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate(draft);
        }}
      >
        <Field
          label="Biography"
          hint="Who you are, in a few honest paragraphs."
          value={draft.biography}
          onChange={(v) => setDraft({ ...draft, biography: v })}
          rows={5}
        />
        <Field
          label="My story"
          hint="Where you started and how you got here."
          value={draft.story}
          onChange={(v) => setDraft({ ...draft, story: v })}
          rows={6}
        />
        <Field
          label="Mission"
          hint="One line: what you're trying to do."
          value={draft.mission}
          onChange={(v) => setDraft({ ...draft, mission: v })}
          rows={2}
        />
        <Field
          label="My business"
          hint="What you sell, make or offer."
          value={draft.business}
          onChange={(v) => setDraft({ ...draft, business: v })}
          rows={4}
        />
        <Field
          label="Foundation involvement"
          hint="Service and giving you're part of."
          value={draft.foundation}
          onChange={(v) => setDraft({ ...draft, foundation: v })}
          rows={3}
        />

        <Field
          label="Websites"
          hint="One per line — “Label | https://link”."
          value={linkLinesToText(draft.websites)}
          onChange={(v) => setDraft({ ...draft, websites: parseLinkLines(v) })}
          rows={3}
        />
        <Field
          label="Business links"
          hint="Storefronts, booking pages, catalogues."
          value={linkLinesToText(draft.businessLinks)}
          onChange={(v) => setDraft({ ...draft, businessLinks: parseLinkLines(v) })}
          rows={3}
        />
        <Field
          label="Social links"
          hint="Only the ones you actually use."
          value={linkLinesToText(draft.socialLinks)}
          onChange={(v) => setDraft({ ...draft, socialLinks: parseLinkLines(v) })}
          rows={3}
        />
        <Field
          label="Portfolio & projects"
          hint="Work worth showing, one per line."
          value={linkLinesToText(draft.portfolio)}
          onChange={(v) => setDraft({ ...draft, portfolio: parseLinkLines(v) })}
          rows={3}
        />
        <Field
          label="Photos"
          hint="Image links, one per line — “Caption | https://image”."
          value={draft.photos.map((p) => (p.caption ? `${p.caption} | ${p.url}` : p.url)).join("\n")}
          onChange={(v) =>
            setDraft({
              ...draft,
              photos: parseLinkLines(v).map((l) => ({ caption: l.label === l.url ? "" : l.label, url: l.url })),
            })
          }
          rows={3}
        />
        <Field
          label="Videos"
          hint="Video links, one per line — “Caption | https://video”."
          value={draft.videos.map((p) => (p.caption ? `${p.caption} | ${p.url}` : p.url)).join("\n")}
          onChange={(v) =>
            setDraft({
              ...draft,
              videos: parseLinkLines(v).map((l) => ({ caption: l.label === l.url ? "" : l.label, url: l.url })),
            })
          }
          rows={3}
        />
        <Field
          label="Skills"
          hint="Comma separated."
          value={draft.skills.join(", ")}
          onChange={(v) => setDraft({ ...draft, skills: parseTags(v) })}
          rows={2}
        />
        <Field
          label="Interests"
          hint="Comma separated."
          value={draft.interests.join(", ")}
          onChange={(v) => setDraft({ ...draft, interests: parseTags(v) })}
          rows={2}
        />
        <Field
          label="Achievements"
          hint="One per line."
          value={draft.achievements.join("\n")}
          onChange={(v) => setDraft({ ...draft, achievements: v.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 40) })}
          rows={3}
        />
        <Field
          label="How to reach me"
          hint="Your contact preference — nobody sees more than you write here."
          value={draft.contactPreference}
          onChange={(v) => setDraft({ ...draft, contactPreference: v })}
          rows={2}
        />

        {error && <p className="text-xs text-white/80">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="chrome-glow inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white transition hover:scale-[1.02] disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" />
            {mutation.isPending ? "Saving…" : "Save my About page"}
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(stored);
              setEditing(false);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white/80 transition hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
        </div>
      </form>
    );
  }

  const empty = aboutIsEmpty(stored);

  return (
    <div className="mt-6">
      {empty ? (
        <p className="max-w-xl text-sm leading-relaxed text-white/70">
          Your About page is blank. This is the part of your page that stays true even when you
          haven't posted in a month — your story, your mission, your business and how people reach
          you.
        </p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          <Prose title="Biography" body={stored.biography} />
          <Prose title="My story" body={stored.story} />
          <Prose title="Mission" body={stored.mission} />
          <Prose title="My business" body={stored.business} />
          <Prose title="Foundation" body={stored.foundation} />
          <Tags title="Skills" items={stored.skills} />
          <Tags title="Interests" items={stored.interests} />
          <Links title="Websites" links={stored.websites} />
          <Links title="Business" links={stored.businessLinks} />
          <Links title="Social" links={stored.socialLinks} />
          <Links title="Portfolio & projects" links={[...stored.portfolio, ...stored.projects]} />
          {stored.photos.length > 0 && (
            <div className="md:col-span-2">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/60">Photos</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {stored.photos.map((p) => (
                  <figure key={p.url} className="overflow-hidden rounded-xl ring-1 ring-white/10">
                    <img
                      src={p.url}
                      alt={p.caption || "A photo from this Builder's About page"}
                      loading="lazy"
                      className="h-40 w-full object-cover"
                    />
                    {p.caption && <figcaption className="p-2 text-xs text-white/70">{p.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            </div>
          )}
          {stored.videos.length > 0 && (
            <div className="md:col-span-2">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/60">Videos</h3>
              <ul className="mt-3 grid gap-2">
                {stored.videos.map((v) => (
                  <li key={v.url}>
                    <a href={v.url} className="text-sm text-white/85 underline" rel="noreferrer noopener" target="_blank">
                      {v.caption || v.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {stored.achievements.length > 0 && (
            <div className="md:col-span-2">
              <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/60">Achievements</h3>
              <ul className="mt-3 list-disc pl-5 text-sm text-white/85">
                {stored.achievements.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          )}
          <Prose title="How to reach me" body={stored.contactPreference} />
        </div>
      )}

      {canEdit && (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="chrome-glow mt-7 inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white transition hover:scale-[1.02]"
        >
          <PenLine className="h-3.5 w-3.5" />
          {empty ? "Write my About page" : "Edit my About page"}
        </button>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  rows,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.3em] text-white/70">{label}</span>
      <span className="mt-1 block text-xs text-white/55">{hint}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-white/20 bg-black/40 p-3 text-sm text-white outline-none focus:border-white/50"
      />
    </label>
  );
}

function Prose({ title, body }: { title: string; body: string }) {
  if (!body.trim()) return null;
  return (
    <section>
      <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/60">{title}</h3>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/85">{body}</p>
    </section>
  );
}

function Tags({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/60">{title}</h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map((i) => (
          <li key={i} className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/85">
            {i}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Links({ title, links }: { title: string; links: { label: string; url: string }[] }) {
  if (links.length === 0) return null;
  return (
    <section>
      <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/60">{title}</h3>
      <ul className="mt-3 grid gap-1.5">
        {links.map((l) => (
          <li key={`${title}-${l.url}`}>
            <a
              href={l.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-sm text-white/85 underline decoration-white/30 underline-offset-4 hover:text-white"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
