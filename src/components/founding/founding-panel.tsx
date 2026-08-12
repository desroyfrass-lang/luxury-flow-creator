import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FoundingBadge } from "@/components/founding/founding-badge";
import {
  FOUNDING_PLAIN_ENGLISH,
  FOUNDING_PRINCIPLE,
  FOUNDING_RULES,
  FOUNDING_STORY_PROMISE,
  FOUNDING_STORY_PROMPTS,
  FOUNDING_VISIBILITY,
  kankoWelcome,
} from "@/lib/founding";
import {
  acceptFoundingRecognition,
  getMyFoundingStatus,
  updateMyFoundingRecord,
} from "@/lib/founding.functions";

const KANKO_SEEN_KEY = "frass.founding.kanko.seen";

/**
 * FRASS-0490 — the Founding Partner panel. It lives inside the Frass Card,
 * because Builder Identity already lives there. No second identity page.
 */
export function FoundingPanel({ name }: { name: string }) {
  const statusFn = useServerFn(getMyFoundingStatus);
  const acceptFn = useServerFn(acceptFoundingRecognition);
  const saveFn = useServerFn(updateMyFoundingRecord);
  const qc = useQueryClient();

  const { data: record } = useQuery({
    queryKey: ["my-founding-status"],
    queryFn: () => statusFn(),
  });

  const [story, setStory] = useState<Record<string, string>>({});
  const [kanko, setKanko] = useState(false);

  useEffect(() => {
    if (!record) return;
    setStory({
      story_why: record.story.story_why ?? "",
      story_hoped: record.story.story_hoped ?? "",
      story_journey: record.story.story_journey ?? "",
      story_lessons: record.story.story_lessons ?? "",
    });
    // Kanko Principle: the first Founding Partner is welcomed once, ever.
    if (record.sequence === 1 && typeof window !== "undefined") {
      if (!window.localStorage.getItem(KANKO_SEEN_KEY)) setKanko(true);
    }
  }, [record]);

  const accept = useMutation({
    mutationFn: () => acceptFn(),
    onSuccess: (r) => {
      qc.setQueryData(["my-founding-status"], r);
      toast.success("Recorded. Your place in the founding record is permanent.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const save = useMutation({
    mutationFn: (patch: Parameters<typeof saveFn>[0]["data"]) => saveFn({ data: patch }),
    onSuccess: (r) => {
      qc.setQueryData(["my-founding-status"], r);
      toast.success("Saved.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!record) return null;

  const dismissKanko = () => {
    window.localStorage.setItem(KANKO_SEEN_KEY, "1");
    setKanko(false);
  };

  return (
    <section className="rounded-2xl border border-[color:var(--gold)]/40 bg-background/60 p-6 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            FRASS-0490 · Founding Partner Program
          </p>
          <FoundingBadge sequence={record.sequence} />
        </div>
        {!record.acceptedAt ? (
          <Button onClick={() => accept.mutate()} disabled={accept.isPending}>
            Accept this recognition
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            Accepted {new Date(record.acceptedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {kanko ? (
        <div className="mt-5 space-y-2 rounded-xl border border-[color:var(--gold)]/40 bg-[color:var(--gold)]/5 p-5">
          {kankoWelcome(name).map((line) => (
            <p key={line} className="text-sm leading-relaxed">
              {line}
            </p>
          ))}
          <Button variant="ghost" size="sm" onClick={dismissKanko}>
            Thank you — carry on
          </Button>
        </div>
      ) : null}

      <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {FOUNDING_PRINCIPLE}
      </p>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {FOUNDING_PLAIN_ENGLISH}
      </p>

      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {FOUNDING_RULES.map((rule) => (
          <li key={rule.id} className="rounded-xl border border-border/60 p-4">
            <p className="text-sm font-semibold">{rule.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{rule.detail}</p>
            <p className="mt-2 text-xs italic text-muted-foreground">{rule.plainEnglish}</p>
          </li>
        ))}
      </ul>

      {/* Visibility — the member's choice, always. */}
      <div className="mt-8 space-y-3">
        <Label className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Who can see it
        </Label>
        <div className="grid gap-3 sm:grid-cols-3">
          {FOUNDING_VISIBILITY.map((v) => {
            const active = record.visibility === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => save.mutate({ visibility: v.id })}
                className={[
                  "rounded-xl border p-4 text-left transition",
                  active
                    ? "border-[color:var(--gold)] bg-[color:var(--gold)]/10"
                    : "border-border/60 hover:border-foreground/30",
                ].join(" ")}
              >
                <p className="text-sm font-semibold">{v.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{v.detail}</p>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Switch
            id="founding-card"
            checked={record.showOnCard}
            onCheckedChange={(checked) => save.mutate({ showOnCard: checked })}
          />
          <Label htmlFor="founding-card" className="text-sm font-normal text-muted-foreground">
            Show the designation on my Frass Card
          </Label>
        </div>
      </div>

      {/* Founding Story — the living history. */}
      <div className="mt-8 space-y-4">
        <div>
          <p className="text-sm font-semibold">Your Founding Story</p>
          <p className="mt-1 max-w-3xl text-xs text-muted-foreground">{FOUNDING_STORY_PROMISE}</p>
        </div>
        {FOUNDING_STORY_PROMPTS.map((p) => (
          <div key={p.key} className="space-y-2">
            <Label htmlFor={p.key} className="text-sm">
              {p.title}
            </Label>
            <p className="text-xs text-muted-foreground">{p.prompt}</p>
            <Textarea
              id={p.key}
              rows={3}
              value={story[p.key] ?? ""}
              onChange={(e) => setStory((s) => ({ ...s, [p.key]: e.target.value }))}
            />
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-4">
          <Button
            onClick={() =>
              save.mutate({
                story_why: story.story_why || null,
                story_hoped: story.story_hoped || null,
                story_journey: story.story_journey || null,
                story_lessons: story.story_lessons || null,
              })
            }
            disabled={save.isPending}
          >
            Save my story
          </Button>
          <div className="flex items-center gap-3">
            <Switch
              id="story-public"
              checked={record.story.isPublic}
              onCheckedChange={(checked) => save.mutate({ storyPublic: checked })}
            />
            <Label htmlFor="story-public" className="text-sm font-normal text-muted-foreground">
              Make my story part of the public history
            </Label>
          </div>
        </div>
      </div>
    </section>
  );
}
