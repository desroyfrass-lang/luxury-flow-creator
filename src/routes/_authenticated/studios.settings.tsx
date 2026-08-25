// FRASS-0600 — studio guardrails. Provider-agnostic on purpose.
import { createFileRoute } from "@tanstack/react-router";
import { StudioCard, StudioSection } from "@/components/studios/studio-ui";

export const Route = createFileRoute("/_authenticated/studios/settings")({
  head: () => ({
    meta: [
      { title: "Studio Settings | Frassy Studios" },
      { name: "description", content: "The permanent rules the studio works under: approval, reuse, rights and publishing." },
      { property: "og:title", content: "Studio Settings | Frassy Studios" },
      { property: "og:description", content: "House rules for how Frass Hill produces and releases work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Settings,
});

const RULES = [
  ["Approval before release", "Nothing publishes because it was generated. A person approves it first."],
  ["Reuse before spend", "If an approved asset already exists, the studio uses it instead of paying to make it again."],
  ["Rights before publishing", "A production that isn't cleared to publish can't enter the publishing queue at all."],
  ["Continuity is permanent", "The Series Bible is memory. New work must respect it, not contradict it."],
  ["Provenance is recorded", "Every piece of work keeps a record of where it came from and who signed it off."],
  ["No vendor lock-in", "The studio is written provider-agnostic, so tools can change without rebuilding anything."],
  ["Founder only", "This whole wing is private to Founder and Admin accounts and is never indexed."],
];

function Settings() {
  return (
    <>
      <h1 className="font-display text-3xl uppercase tracking-tight">Studio Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        These are the house rules the studio enforces in code, not preferences you can accidentally switch off.
      </p>

      <StudioSection title="Permanent rules">
        <div className="grid gap-3 md:grid-cols-2">
          {RULES.map(([title, body]) => (
            <StudioCard key={title} title={title}>
              <p className="text-sm text-muted-foreground">{body}</p>
            </StudioCard>
          ))}
        </div>
      </StudioSection>
    </>
  );
}
