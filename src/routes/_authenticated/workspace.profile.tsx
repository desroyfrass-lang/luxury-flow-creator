import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { PageFeedback } from "@/components/page-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import {
  changeMyPassword,
  getMyAccountLogin,
  getMyProfile,
  updateMyProfile,
} from "@/lib/profiles.functions";
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

const panel = "rounded-2xl border border-border/60 bg-background/60 p-6 backdrop-blur";
const heading = "text-xs uppercase tracking-[0.25em] text-muted-foreground";

function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const getProfile = useServerFn(getMyProfile);
  const saveProfile = useServerFn(updateMyProfile);
  const getLogin = useServerFn(getMyAccountLogin);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => getProfile(),
  });
  const { data: login } = useQuery({
    queryKey: ["my-account-login"],
    queryFn: () => getLogin(),
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
      toast.success("Saved. Your account details are up to date.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not save. Try a different handle?");
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
      full_name: form.full_name ?? null,
      phone: form.phone ?? null,
      address_line1: form.address_line1 ?? null,
      address_line2: form.address_line2 ?? null,
      city: form.city ?? null,
      region: form.region ?? null,
      postal_code: form.postal_code ?? null,
      country: form.country ?? null,
    });
    setSaving(false);
  };

  const publicUrl =
    typeof window !== "undefined" && form.handle
      ? `${window.location.origin}/builder/${form.handle}`
      : null;

  const set = (key: keyof BuilderProfile) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="relative min-h-screen px-6 py-12 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl uppercase tracking-[0.12em]">Your Account</h1>
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
          <Tabs defaultValue="account">
            <TabsList className="mb-6">
              <TabsTrigger value="account">Personal Account</TabsTrigger>
              <TabsTrigger value="identity">Builder Identity</TabsTrigger>
              <TabsTrigger value="security">Sign-in & Password</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit}>
              <TabsContent value="account" className="space-y-8">
                <section className={panel}>
                  <h2 className={heading}>Personal details</h2>
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full name</Label>
                      <Input id="full_name" value={form.full_name ?? ""} onChange={set("full_name")} placeholder="Your legal name" maxLength={160} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={form.phone ?? ""} onChange={set("phone")} placeholder="+1 555 000 0000" maxLength={40} />
                    </div>
                  </div>
                </section>

                <section className={panel}>
                  <h2 className={heading}>Address</h2>
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address_line1">Address line 1</Label>
                      <Input id="address_line1" value={form.address_line1 ?? ""} onChange={set("address_line1")} placeholder="Street address" maxLength={200} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address_line2">Address line 2</Label>
                      <Input id="address_line2" value={form.address_line2 ?? ""} onChange={set("address_line2")} placeholder="Apartment, suite (optional)" maxLength={200} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={form.city ?? ""} onChange={set("city")} maxLength={120} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="region">State / Parish / Province</Label>
                      <Input id="region" value={form.region ?? ""} onChange={set("region")} maxLength={120} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Postal code</Label>
                      <Input id="postal_code" value={form.postal_code ?? ""} onChange={set("postal_code")} maxLength={40} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" value={form.country ?? ""} onChange={set("country")} maxLength={120} />
                    </div>
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="identity" className="space-y-8">
                <section className={panel}>
                  <h2 className={heading}>Identity</h2>
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="display_name">Display name</Label>
                      <Input id="display_name" value={form.display_name ?? ""} onChange={set("display_name")} placeholder="How you appear across Frass" maxLength={120} />
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
                      Public profile:{" "}
                      <a href={publicUrl} className="text-[color:var(--gold)] hover:underline">
                        {publicUrl}
                      </a>
                    </div>
                  )}
                </section>

                <section className={panel}>
                  <h2 className={heading}>Presence</h2>
                  <div className="mt-6 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="avatar_url">Avatar URL</Label>
                      <Input id="avatar_url" value={form.avatar_url ?? ""} onChange={set("avatar_url")} placeholder="https://..." />
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

                <section className={panel}>
                  <h2 className={heading}>Journey</h2>
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
                      <Input id="primary_district" value={form.primary_district ?? ""} onChange={set("primary_district")} placeholder="e.g. Academy, Marketplace, Studio" maxLength={80} />
                    </div>
                  </div>
                </section>

                <section className={`${panel} flex items-center justify-between`}>
                  <div>
                    <h2 className={heading}>Public profile</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Let other Builders discover your profile at /builder/your-handle. Your address and phone are never shown.
                    </p>
                  </div>
                  <Switch
                    checked={form.is_public ?? false}
                    onCheckedChange={(checked) => setForm((f) => ({ ...f, is_public: checked }))}
                    aria-label="Make profile public"
                  />
                </section>
              </TabsContent>

              <div className="mt-8 flex items-center justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => router.history.back()}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[color:var(--gold)] text-[color:var(--ink)] hover:bg-[color:var(--gold-soft,#f0d78c)]"
                >
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>

            <TabsContent value="security">
              <SecurityTab email={login?.email ?? profile?.email ?? null} lastSignInAt={login?.lastSignInAt ?? null} />
            </TabsContent>
          </Tabs>
        )}
      </div>
      <PageFeedback pageTitle="Builder Profile" />
    </div>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-11"
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? `Hide ${label}` : `Show ${label}`}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function SecurityTab({ email, lastSignInAt }: { email: string | null; lastSignInAt: string | null }) {
  const change = useServerFn(changeMyPassword);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      const res = await change({ data: { currentPassword: current, newPassword: next } });
      if (res.ok) {
        toast.success(res.message);
        setCurrent("");
        setNext("");
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update your password.");
    }
    setBusy(false);
  };

  const sendReset = async () => {
    if (!email) return;
    setSending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSending(false);
    toast[error ? "error" : "success"](
      error ? error.message : `Recovery link sent to ${email}. Check your inbox.`,
    );
  };

  return (
    <div className="space-y-8">
      <section className={panel}>
        <h2 className={heading}>Sign-in details</h2>
        <div className="mt-6 space-y-2">
          <Label htmlFor="login_email">Login name (email)</Label>
          <Input id="login_email" value={email ?? ""} readOnly className="bg-foreground/5" />
          {lastSignInAt && (
            <p className="text-xs text-muted-foreground">
              Last signed in {new Date(lastSignInAt).toLocaleString()}
            </p>
          )}
        </div>
      </section>

      <section className={panel}>
        <h2 className={heading}>Password</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Your existing password is stored one-way encrypted, so it can never be displayed back to
          you — not by Frass, and not by anyone else. That is what keeps your account safe. Set a new
          one below and use the eye to reveal exactly what you are typing.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          <span className="text-[color:var(--gold)]">In plain English:</span> a password is kept like
          a fingerprint smudge, not a photo — we can check a match, but we can't read it back. If you
          forgot yours, email yourself a recovery link below.
        </p>

        <form onSubmit={onChangePassword} className="mt-6 grid gap-6 md:grid-cols-2">
          <PasswordField
            id="current_password"
            label="Current password"
            value={current}
            onChange={setCurrent}
            placeholder="Your password today"
          />
          <PasswordField
            id="new_password"
            label="New password"
            value={next}
            onChange={setNext}
            placeholder="At least 8 characters"
          />
          <div className="md:col-span-2 flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              disabled={busy || !current || !next}
              className="bg-[color:var(--gold)] text-[color:var(--ink)] hover:bg-[color:var(--gold-soft,#f0d78c)]"
            >
              {busy ? "Updating..." : "Update password"}
            </Button>
            <Button type="button" variant="outline" onClick={sendReset} disabled={sending || !email}>
              {sending ? "Sending..." : "I forgot it — email me a reset link"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
