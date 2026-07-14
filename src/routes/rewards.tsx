import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site-shell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Gift,
  Check,
  Mail,
  UserCircle2,
  Newspaper,
  Instagram,
  Facebook,
  Copy,
  Sparkles,
  Camera,
  ShoppingBag,
} from "lucide-react";
import {
  getRewardStatus,
  saveProfileInfo,
  subscribeNewsletter,
  confirmSocialFollow,
  claimReward,
  type RewardStatus,
} from "@/lib/rewards.functions";

export const Route = createFileRoute("/rewards")({
  head: () => ({
    meta: [
      { title: "Unlock 40% OFF — Frass Kicks Rewards" },
      {
        name: "description",
        content:
          "Complete 4 quick steps to unlock a one-time 40% off your first Frass Kicks purchase.",
      },
    ],
  }),
  component: RewardsPage,
});

const STYLE_OPTIONS = ["Streetwear", "Luxury", "Athletic", "Y2K", "Minimal", "Vintage"];
const CATEGORY_OPTIONS = ["Frass Kicks", "Frass Drip", "Bare Drip", "Capsules", "Virals"];

const TIKTOK_URL = "https://www.tiktok.com/@frasskicks";
const INSTAGRAM_URL = "https://www.instagram.com/frasskicks";
const FACEBOOK_URL = "https://www.facebook.com/frasskicks";

function TikTokIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
      <path d="M19.6 6.3a5.6 5.6 0 0 1-3.4-1.2v9.2a5.9 5.9 0 1 1-5.9-5.9c.3 0 .6 0 .9.1v3a2.9 2.9 0 1 0 2 2.7V2h2.9a5.6 5.6 0 0 0 3.5 4.3v0z" />
    </svg>
  );
}

function RewardsPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [session, setSession] = useState<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingSession(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const fetchStatus = useServerFn(getRewardStatus);
  const { data: status, refetch, isLoading } = useQuery({
    queryKey: ["reward-status", session?.user.id ?? "anon"],
    queryFn: () => fetchStatus(),
    enabled: Boolean(session),
  });

  const percent = status?.percent ?? 0;

  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-6 py-12 lg:py-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--gold,#c9a24a)]/15 px-4 py-1 text-[11px] uppercase tracking-[0.3em] text-[color:var(--gold,#c9a24a)]">
            <Gift className="h-3.5 w-3.5" /> New customer reward
          </div>
          <h1 className="mt-5 font-display text-5xl md:text-7xl leading-none">
            UNLOCK <span className="text-[color:var(--gold,#c9a24a)]">40% OFF</span>
            <br /> YOUR FIRST ORDER
          </h1>
          <p className="mt-4 text-sm text-muted-foreground max-w-lg mx-auto">
            Complete 4 simple steps. One-time coupon, one per email. Under 3 minutes.
          </p>
        </div>

        {/* Progress */}
        <div className="mt-10 rounded-3xl border border-border bg-background/60 p-6 md:p-8 backdrop-blur">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            <span>Your progress</span>
            <span className="text-[color:var(--gold,#c9a24a)] font-bold">{percent}% / 40%</span>
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-secondary/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-[color:var(--gold,#c9a24a)] transition-all"
              style={{ width: `${(percent / 40) * 100}%` }}
            />
          </div>

          {!session && !loadingSession && (
            <div className="mt-6 rounded-2xl border border-dashed border-border p-6 text-center">
              <p className="text-sm">Create your Frass account to start unlocking rewards.</p>
              <button
                onClick={() =>
                  navigate({ to: "/auth", search: { next: "/rewards" } })
                }
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-xs uppercase tracking-[0.25em] text-background"
              >
                <UserCircle2 className="h-4 w-4" /> Sign in / Sign up
              </button>
            </div>
          )}
        </div>

        {session && status && !isLoading && (
          <div className="mt-8 space-y-5">
            <Step1Profile status={status} onDone={() => refetch()} />
            <Step2Newsletter status={status} onDone={() => refetch()} />
            <Step3Verify status={status} onDone={() => refetch()} sessionEmail={status.email} />
            <Step4Social status={status} onDone={() => refetch()} />

            <ClaimBlock status={status} onClaimed={() => { refetch(); router.invalidate(); }} />
          </div>
        )}
      </section>
    </SiteShell>
  );
}

function StepCard({
  n,
  title,
  desc,
  done,
  children,
}: {
  n: number;
  title: string;
  desc: string;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-3xl border p-6 md:p-7 transition ${
        done
          ? "border-[color:var(--gold,#c9a24a)]/60 bg-[color:var(--gold,#c9a24a)]/5"
          : "border-border bg-background/60"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
            done
              ? "bg-[color:var(--gold,#c9a24a)] text-[color:var(--ink,#0a0a0a)]"
              : "bg-secondary text-foreground"
          }`}
        >
          {done ? <Check className="h-5 w-5" /> : n}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-2xl">{title}</h3>
            <span
              className={`ml-auto rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${
                done
                  ? "bg-[color:var(--gold,#c9a24a)] text-[color:var(--ink,#0a0a0a)]"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              +10%
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs transition ${
        active
          ? "border-[color:var(--gold,#c9a24a)] bg-[color:var(--gold,#c9a24a)] text-[color:var(--ink,#0a0a0a)]"
          : "border-border bg-background hover:bg-secondary/60"
      }`}
    >
      {children}
    </button>
  );
}

function Step1Profile({ status, onDone }: { status: RewardStatus; onDone: () => void }) {
  const [open, setOpen] = useState(!status.steps.profile);
  const [fullName, setFullName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [styles, setStyles] = useState<string[]>([]);
  const [cats, setCats] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const save = useServerFn(saveProfileInfo);

  const toggle = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  return (
    <StepCard
      n={1}
      title="Complete your profile"
      desc="Tell us who you are and what you love."
      done={status.steps.profile}
    >
      {status.steps.profile ? (
        <p className="text-sm text-[color:var(--gold,#c9a24a)]">✓ Profile saved · 10% unlocked</p>
      ) : !open ? (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs uppercase tracking-[0.25em] text-background"
        >
          <UserCircle2 className="h-4 w-4" /> Open my profile
        </button>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!fullName || !gender || styles.length === 0 || cats.length === 0) {
              toast.error("Fill your name, gender, and pick at least one style + category");
              return;
            }
            setSaving(true);
            try {
              await save({
                data: {
                  full_name: fullName,
                  birthday: birthday || null,
                  gender,
                  style_preferences: styles,
                  favorite_categories: cats,
                },
              });
              toast.success("Profile saved! +10%");
              onDone();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Save failed");
            } finally {
              setSaving(false);
            }
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Full name</span>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Birthday (optional)</span>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Gender preference</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Men", "Women", "Unisex"].map((g) => (
                <Chip key={g} active={gender === g} onClick={() => setGender(g)}>{g}</Chip>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Style preferences</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {STYLE_OPTIONS.map((s) => (
                <Chip key={s} active={styles.includes(s)} onClick={() => setStyles(toggle(styles, s))}>{s}</Chip>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Favorite categories</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((c) => (
                <Chip key={c} active={cats.includes(c)} onClick={() => setCats(toggle(cats, c))}>{c}</Chip>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-xs uppercase tracking-[0.25em] text-background disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
        </form>
      )}
    </StepCard>
  );
}

function Step2Newsletter({ status, onDone }: { status: RewardStatus; onDone: () => void }) {
  const subscribe = useServerFn(subscribeNewsletter);
  const [busy, setBusy] = useState(false);
  return (
    <StepCard
      n={2}
      title="Join the Frass newsletter"
      desc="Exclusive drops, capsule releases, and members-only offers."
      done={status.steps.newsletter}
    >
      {status.steps.newsletter ? (
        <p className="text-sm text-[color:var(--gold,#c9a24a)]">✓ You're in the Inner Circle · 10% unlocked</p>
      ) : (
        <button
          onClick={async () => {
            setBusy(true);
            try {
              await subscribe();
              toast.success("Welcome to the Inner Circle! +10%");
              onDone();
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Signup failed");
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs uppercase tracking-[0.25em] text-background disabled:opacity-50"
        >
          <Newspaper className="h-4 w-4" /> {busy ? "Joining…" : "Join newsletter"}
        </button>
      )}
    </StepCard>
  );
}

function Step3Verify({
  status,
  onDone,
  sessionEmail,
}: {
  status: RewardStatus;
  onDone: () => void;
  sessionEmail: string | null;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <StepCard
      n={3}
      title="Verify your email"
      desc={sessionEmail ? `We'll send a confirmation to ${sessionEmail}.` : "Confirm your email address."}
      done={status.steps.emailVerified}
    >
      {status.steps.emailVerified ? (
        <p className="text-sm text-[color:var(--gold,#c9a24a)]">✓ Email verified · 10% unlocked</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          <button
            disabled={busy || !sessionEmail}
            onClick={async () => {
              if (!sessionEmail) return;
              setBusy(true);
              try {
                const { error } = await supabase.auth.resend({
                  type: "signup",
                  email: sessionEmail,
                });
                if (error) throw error;
                toast.success("Verification email sent — check your inbox");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Could not send");
              } finally {
                setBusy(false);
              }
            }}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs uppercase tracking-[0.25em] text-background disabled:opacity-50"
          >
            <Mail className="h-4 w-4" /> {busy ? "Sending…" : "Send verification email"}
          </button>
          <button
            onClick={() => onDone()}
            className="rounded-full border border-border bg-background px-5 py-2.5 text-xs uppercase tracking-[0.25em]"
          >
            I already verified — refresh
          </button>
        </div>
      )}
    </StepCard>
  );
}

function Step4Social({ status, onDone }: { status: RewardStatus; onDone: () => void }) {
  const confirm = useServerFn(confirmSocialFollow);
  const [busy, setBusy] = useState(false);
  const [visited, setVisited] = useState<Record<string, boolean>>({});
  const visit = (k: string, url: string) => {
    setVisited((v) => ({ ...v, [k]: true }));
    window.open(url, "_blank", "noopener,noreferrer");
  };
  const allVisited = visited.tiktok && visited.instagram && visited.facebook;

  return (
    <StepCard
      n={4}
      title="Follow Frass on socials"
      desc="Tap each icon — TikTok, Instagram, and Facebook — then confirm."
      done={status.steps.social}
    >
      {status.steps.social ? (
        <p className="text-sm text-[color:var(--gold,#c9a24a)]">✓ Thanks for the follow · 10% unlocked</p>
      ) : (
        <div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => visit("tiktok", TIKTOK_URL)}
              className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition ${
                visited.tiktok
                  ? "border-[color:var(--gold,#c9a24a)] bg-[color:var(--gold,#c9a24a)]/10"
                  : "border-border bg-background hover:bg-secondary/60"
              }`}
              aria-label="Open TikTok"
            >
              <TikTokIcon className="h-6 w-6" />
            </button>
            <button
              onClick={() => visit("instagram", INSTAGRAM_URL)}
              className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition ${
                visited.instagram
                  ? "border-[color:var(--gold,#c9a24a)] bg-[color:var(--gold,#c9a24a)]/10"
                  : "border-border bg-background hover:bg-secondary/60"
              }`}
              aria-label="Open Instagram"
            >
              <Instagram className="h-6 w-6" />
            </button>
            <button
              onClick={() => visit("facebook", FACEBOOK_URL)}
              className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition ${
                visited.facebook
                  ? "border-[color:var(--gold,#c9a24a)] bg-[color:var(--gold,#c9a24a)]/10"
                  : "border-border bg-background hover:bg-secondary/60"
              }`}
              aria-label="Open Facebook"
            >
              <Facebook className="h-6 w-6" />
            </button>
          </div>
          <button
            disabled={!allVisited || busy}
            onClick={async () => {
              setBusy(true);
              try {
                await confirm();
                toast.success("Locked in — thanks for the follow! +10%");
                onDone();
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Failed");
              } finally {
                setBusy(false);
              }
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-xs uppercase tracking-[0.25em] text-background disabled:opacity-50"
          >
            {allVisited ? (busy ? "Saving…" : "I followed Frass") : "Tap all 3 icons above first"}
          </button>
        </div>
      )}
    </StepCard>
  );
}

function ClaimBlock({ status, onClaimed }: { status: RewardStatus; onClaimed: () => void }) {
  const claim = useServerFn(claimReward);
  const [busy, setBusy] = useState(false);
  const canClaim =
    status.steps.profile && status.steps.newsletter && status.steps.emailVerified && status.steps.social;

  useEffect(() => {
    if (canClaim && !status.code && !busy) {
      setBusy(true);
      claim()
        .then(() => {
          onClaimed();
        })
        .catch((err) => toast.error(err instanceof Error ? err.message : "Claim failed"))
        .finally(() => setBusy(false));
    }
  }, [canClaim, status.code]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!status.code) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-border p-8 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          Complete all 4 steps to reveal your 40% OFF coupon.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border-2 border-[color:var(--gold,#c9a24a)] bg-gradient-to-br from-[color:var(--gold,#c9a24a)]/15 to-transparent p-8 text-center">
      <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--gold,#c9a24a)] px-4 py-1 text-[11px] uppercase tracking-[0.3em] text-[color:var(--ink,#0a0a0a)] font-bold">
        <Gift className="h-3.5 w-3.5" /> 40% Unlocked
      </div>
      <h3 className="mt-4 font-display text-4xl md:text-5xl">Congratulations!</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Your one-time coupon is ready. Apply at checkout.
      </p>
      <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border-2 border-dashed border-[color:var(--gold,#c9a24a)] bg-background px-6 py-4">
        <code className="font-display text-2xl tracking-widest">{status.code}</code>
        <button
          onClick={() => {
            navigator.clipboard.writeText(status.code!);
            toast.success("Coupon copied");
          }}
          className="rounded-full bg-foreground p-2 text-background"
          aria-label="Copy coupon"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
      {status.redeemed && (
        <p className="mt-3 text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Already redeemed
        </p>
      )}

      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/capsules"
          className="group rounded-2xl border border-border bg-background/60 p-6 text-left transition hover:border-[color:var(--gold,#c9a24a)]"
        >
          <ShoppingBag className="h-6 w-6 text-[color:var(--gold,#c9a24a)]" />
          <h4 className="mt-3 font-display text-xl">Explore Capsules</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete looks — outfits built from Frass pieces.
          </p>
        </Link>
        <Link
          to="/try-on"
          className="group rounded-2xl border border-border bg-background/60 p-6 text-left transition hover:border-[color:var(--gold,#c9a24a)]"
        >
          <Camera className="h-6 w-6 text-[color:var(--gold,#c9a24a)]" />
          <h4 className="mt-3 font-display text-xl">Try It On</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload a photo. Preview Frass on you before you buy.
          </p>
        </Link>
      </div>

      <Link
        to="/"
        className="mt-8 inline-block rounded-full bg-foreground px-8 py-3.5 text-xs uppercase tracking-[0.3em] text-background"
      >
        Start shopping
      </Link>
    </div>
  );
}
