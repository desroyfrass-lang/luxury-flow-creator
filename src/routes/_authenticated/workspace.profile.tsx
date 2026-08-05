import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageFeedback } from "@/components/page-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { getMyProfile, updateMyProfile } from "@/lib/profiles.functions";
import type { BuilderProfile } from "@/lib/profiles.functions";

export const Route = createFileRoute("/_authenticated/workspace/profile")({
  head: () => ({
    meta: [
      { title: "Builder Profile — Frass OS" },
      { name: "description", content: "Manage your Builder identity across the Frass ecosystem." },
      { property: "og:title", content: "Builder Profile — Frass OS" },
      { property: "og:description", content: "Manage your Builder identity across the Frass ecosystem." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const getProfile = useServerFn(getMyProfile);
  const saveProfile = useServerFn(updateMyProfile);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getProfile(),
  });

  const [form, setForm] = useState<Partial<BuilderProfile>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof saveProfile>[0]["data"]) => saveProfile({ data: payload }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["my-profile"], updated);
      toast.success("Profile saved. Your Builder identity is up to date.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not save profile. Try a different handle?");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await mutation.mutateAsync({
      display_name: form.display_name ?? null,
      handle: form.handle ?? null,
      bio: form.bio ?? null,
      avatar_url: form.avatar_url ?? null,
      is_public: form.is_public ?? false,
      builder_stage: (form.builder_stage as "visitor" | "explorer" | "builder" | "steward") ?? "visitor",
      primary_district: form.primary_district ?? null,
    });
    setSaving(false);
  };

  const publicUrl = form.handle ? `${window.location.origin}/builder/${form.handle}` : null;

  return (
    <div className="relative min-h-screen px-6 py-12 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl uppercase tracking-[0.12em]">Builder Profile</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your identity across every Frass district. One Builder. One journey.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/workspace">Back to Workspace</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-12 animate-pulse rounded-xl bg-foreground/5" />
            <div className="h-32 animate-pulse rounded-xl bg-foreground/5" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="rounded-2xl border border-border/60 bg-background/60 p-6 backdrop-blur">
              <h2 className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Identity</h2>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display name</Label>
                  <Input
                    id="display_name"
                    value={form.display_name ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
                    placeholder="How you appear across Frass"
                    maxLength={120}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="handle">Builder handle</Label>
                  <Input
                    id="handle"
                    value={form.handle ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        handle: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                      }))
                    }
                    placeholder="your_handle"
                    maxLength={40}
                  />
                  <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and underscores only.</p>
                </div>
              </div>

              {publicUrl && (
                <div className="mt-4 text-xs text-muted-foreground">
                  Public profile: {" "}
                  <a href={publicUrl} className="text-[color:var(--gold)] hover:underline">
                    {publicUrl}
                  </a>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-border/60 bg-background/60 p-6 backdrop-blur">
              <h2 className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Presence</h2>
              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="avatar_url">Avatar URL</Label>
                  <Input
                    id="avatar_url"
                    value={form.avatar_url ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, avatar_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={form.bio ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="Tell the Frass community who you are building for."
                    maxLength={1000}
                    rows={5}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border/60 bg-background/60 p-6 backdrop-blur">
              <h2 className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Journey</h2>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="builder_stage">Builder stage</Label>
                  <select
                    id="builder_stage"
                    value={form.builder_stage ?? "visitor"}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        builder_stage: e.target.value as BuilderProfile["builder_stage"],
                      }))
                    }
                    className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm outline-none focus:border-[color:var(--gold)]"
                  >
                    <option value="visitor">Visitor</option>
                    <option value="explorer">Explorer</option>
                    <option value="builder">Builder</option>
                    <option value="steward">Steward</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary_district">Primary district</Label>
                  <Input
                    id="primary_district"
                    value={form.primary_district ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, primary_district: e.target.value }))}
                    placeholder="e.g. Academy, Marketplace, Studio"
                    maxLength={80}
                  />
                </div>
              </div>
            </section>

            <section className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/60 p-6 backdrop-blur">
              <div>
                <h2 className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Public profile</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Let other Builders discover your profile at /builder/your-handle.
                </p>
              </div>
              <Switch
                checked={form.is_public ?? false}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, is_public: checked }))}
                aria-label="Make profile public"
              />
            </section>

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => router.history.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-[color:var(--gold)] text-[color:var(--ink)] hover:bg-[color:var(--gold-soft,#f0d78c)]">
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
