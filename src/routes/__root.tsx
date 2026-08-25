import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { WelcomeLinkClaim } from "@/components/link/welcome-link-claim";
import { VoiceStateOverlay } from "@/components/voice-state-overlay";
import { FounderPreviewReset } from "@/components/founder/preview-reset";
import { SimulationModeBar } from "@/components/founder/simulation-mode-bar";
import { FrassyChat } from "@/components/frassy-chat";
import { TeleportReturnChip } from "@/components/founder/teleport-return-chip";
import { FrassyEngineBadge } from "@/components/founder/frassy-engine-badge";

import { frassySurface } from "@/lib/frassy/surfaces";
import { FrassyHost } from "@/components/frassy-host";
// Step 2 — existing Frassy systems, revived: the voice transport, the consent
// moment, and the one-Frassy-at-a-time stage rule.
import { FrassyConversationDock } from "@/components/voice/frassy-conversation-dock";
import { FrassyConsentGate } from "@/components/frassy/frassy-consent-gate";
import {
  isEntranceActive,
  isEntranceActiveServer,
  subscribeEntrance,
} from "@/lib/frassy/host-presence";
import { DailyGate } from "@/components/workspace/daily-gate";
import { ConstructionMode } from "@/components/construction/blueprint-mode";

import { RewardsRibbon } from "@/components/rewards-ribbon";
import { FrassTrail } from "@/components/frass-trail";
import { ViewModeProvider } from "@/lib/view-mode/view-mode";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl">404</h1>
        <h2 className="mt-2 text-xl font-medium">Off the runway</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          This page doesn't exist — but the showroom is still open.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-xs uppercase tracking-[0.25em] text-background hover:bg-foreground/90 transition"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl">This page didn't load</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Something interrupted the experience. Try again or head back.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-xs uppercase tracking-[0.25em] text-background"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-xs uppercase tracking-[0.25em]"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Frass Kicks — Luxury Footwear, Fashion & Swim" },
      {
        name: "description",
        content:
          "Frass Kicks is a luxury fashion destination — premium footwear, Frass Drip apparel, and Bare Drip swim & intimates. Made for movement. Built for confidence.",
      },
      { property: "og:title", content: "Frass Kicks — Luxury Fashion Destination" },
      { property: "og:description", content: "Premium footwear, apparel, swim & intimates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Archivo:wght@400;500;600;700;800;900&family=Archivo+Narrow:wght@400;600;700&family=Caveat:wght@500;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@300;400;500;600;700&family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function FrassyCompanion() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const entrance = useSyncExternalStore(
    subscribeEntrance,
    isEntranceActive,
    isEntranceActiveServer,
  );
  if (frassySurface(pathname) !== "beacon") return null;
  // Step 2 — she never appears twice: the cinematic host holds the stage alone.
  if (entrance) return null;
  return <FrassyChat />;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ViewModeProvider>
        <RewardsRibbon />
        <FrassTrail />
        <Outlet />
        <WelcomeLinkClaim />
        <Toaster position="top-center" />
        {/* FRASS-0558 — one Frassy. She only floats where the page has no conversation of its own. */}
        <FrassyCompanion />
        <FrassyHost />
        {/* Step 2 — one dock, globally mounted, self-gated by the surface rules. */}
        <FrassyConversationDock />
        {/* Step 2 — the visitor chooses voice before she ever speaks. */}
        <FrassyConsentGate />
        {/* FRASS-0560 — every build begins at the front door. */}
        <FounderPreviewReset />
        {/* FRASS-0562 — simulate the state of a member, never a second account. */}
        <SimulationModeBar />
        <DailyGate />
        <ConstructionMode />

        <VoiceStateOverlay />
        {/* FRASS-0570 — the way back from a Founder inspection trip. */}
        <TeleportReturnChip />
        {/* FRASS-0572A — which Frassy engine is answering (Founder only). */}
        <FrassyEngineBadge />

      </ViewModeProvider>
    </QueryClientProvider>
  );
}
