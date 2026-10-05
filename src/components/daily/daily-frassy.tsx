import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FrassyChat } from "@/components/frassy-chat";
import dailyOriginal from "@/assets/frassy-daily-seated-exact-original.png.asset.json";

/** Presentation only: the canonical Daily and Welcome Hall keep their own state. */
export function DailyFrassy({ openSignal, onOpen }: { openSignal: number; onOpen: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    const timer = window.setTimeout(() => setSettled(true), 1900);
    return () => window.clearTimeout(timer);
  }, [loaded]);

  return (
    <>
      <Button
        variant="ghost"
        className={`daily-frassy-restored ${settled ? "is-small" : ""}`}
        aria-label="Talk to Frassy in Daily"
        aria-controls="daily-frassy-conversation"
        title="Talk to Frassy"
        onClick={onOpen}
        data-daily-frassy={settled ? "settled" : "entrance"}
      >
        <img src={dailyOriginal.url} alt="Frassy in her approved ivory suit, seated with her tablet in her office" width={1025} height={1024} loading="eager" onLoad={() => setLoaded(true)} />
      </Button>
      <div id="daily-frassy-conversation">
        <FrassyChat tone="light" hideBeacon workspaceContext="The Daily — help me with today's real work while I stay in my Daily." presentation="daily" openSignal={openSignal} />
      </div>
    </>
  );
}