/**
 * FRASS-0423 §5/§6 — the Living Biography.
 *
 * The About section of FOR ME is a permanent introduction, separate from posts,
 * stories and activity. Members keep editing it as their life and business
 * change, so it is stored as one structured document on the profile.
 */
import { z } from "zod";

export const AboutLinkSchema = z.object({
  label: z.string().max(80),
  url: z.string().max(500),
});

export const AboutMediaSchema = z.object({
  url: z.string().max(1000),
  caption: z.string().max(200).optional().default(""),
});

/**
 * FRASS-0423 Amendment — Legacy.
 *
 * The permanent, intentional part of a member's story: what they built, who
 * they're proud of, the lessons they'd pass on. Never algorithmic, never
 * chronological.
 */
export const LegacySchema = z.object({
  built: z.string().max(3000).optional().default(""),
  proudOf: z.string().max(3000).optional().default(""),
  children: z.string().max(3000).optional().default(""),
  family: z.string().max(3000).optional().default(""),
  businesses: z.string().max(3000).optional().default(""),
  foundationWork: z.string().max(3000).optional().default(""),
  lifeLessons: z.string().max(4000).optional().default(""),
  dreams: z.string().max(3000).optional().default(""),
});

export type BuilderLegacy = z.infer<typeof LegacySchema>;

export const LEGACY_FIELDS: { key: keyof BuilderLegacy; label: string; hint: string }[] = [
  { key: "built", label: "I built", hint: "The things that exist because of you." },
  { key: "proudOf", label: "I'm proud of", hint: "Moments worth keeping forever." },
  { key: "children", label: "My children", hint: "Who they are, in your own words." },
  { key: "family", label: "My family", hint: "The people you come from and belong to." },
  { key: "businesses", label: "My businesses", hint: "What you started, grew or carry." },
  { key: "foundationWork", label: "My Foundation work", hint: "Service, giving and who it reached." },
  { key: "lifeLessons", label: "My life lessons", hint: "What you'd want someone to read years from now." },
  { key: "dreams", label: "My dreams", hint: "What you're still walking toward." },
];

export const BuilderAboutSchema = z.object({
  legacy: LegacySchema.optional().default({}),
  biography: z.string().max(4000).optional().default(""),
  story: z.string().max(6000).optional().default(""),
  mission: z.string().max(1000).optional().default(""),
  business: z.string().max(4000).optional().default(""),
  foundation: z.string().max(2000).optional().default(""),
  skills: z.array(z.string().max(60)).max(40).optional().default([]),
  interests: z.array(z.string().max(60)).max(40).optional().default([]),
  websites: z.array(AboutLinkSchema).max(20).optional().default([]),
  businessLinks: z.array(AboutLinkSchema).max(20).optional().default([]),
  socialLinks: z.array(AboutLinkSchema).max(20).optional().default([]),
  portfolio: z.array(AboutLinkSchema).max(40).optional().default([]),
  projects: z.array(AboutLinkSchema).max(40).optional().default([]),
  photos: z.array(AboutMediaSchema).max(40).optional().default([]),
  videos: z.array(AboutMediaSchema).max(20).optional().default([]),
  achievements: z.array(z.string().max(200)).max(40).optional().default([]),
  contactPreference: z.string().max(200).optional().default(""),
});

export type AboutLink = z.infer<typeof AboutLinkSchema>;
export type AboutMedia = z.infer<typeof AboutMediaSchema>;
export type BuilderAbout = z.infer<typeof BuilderAboutSchema>;

export const EMPTY_ABOUT: BuilderAbout = BuilderAboutSchema.parse({});

/** Reads whatever is stored on the profile into a safe, complete About document. */
export function parseAbout(raw: unknown): BuilderAbout {
  const result = BuilderAboutSchema.safeParse(raw ?? {});
  return result.success ? result.data : EMPTY_ABOUT;
}

/** Splits a comma-separated field into a clean list of tags. */
export function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 40);
}

/** Parses "Label | https://url" lines into links. Blank or malformed lines are dropped. */
export function parseLinkLines(value: string): AboutLink[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, url] = line.includes("|") ? line.split("|") : [line, line];
      return { label: label.trim().slice(0, 80), url: (url ?? "").trim().slice(0, 500) };
    })
    .filter((l) => l.url.length > 0)
    .slice(0, 40);
}

export function linkLinesToText(links: AboutLink[]): string {
  return links.map((l) => (l.label === l.url ? l.url : `${l.label} | ${l.url}`)).join("\n");
}

/** True when nothing has been written in the Legacy section yet. */
export function legacyIsEmpty(legacy: BuilderLegacy): boolean {
  return LEGACY_FIELDS.every((f) => !(legacy[f.key] ?? "").trim());
}

/** True when a Builder has actually written something here. */
export function aboutIsEmpty(about: BuilderAbout): boolean {
  return (
    !about.biography.trim() &&
    !about.story.trim() &&
    !about.mission.trim() &&
    !about.business.trim() &&
    about.websites.length === 0 &&
    about.socialLinks.length === 0 &&
    about.photos.length === 0 &&
    about.videos.length === 0
  );
}
