import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FrassyChat } from "@/components/frassy-chat";
import dailyOriginal from "@/assets/frassy-daily-seated-exact-original.png.asset.json";
import { useAuthUserId } from "@/lib/auth/identity-watch";
import { dailyMotionTestOptions } from "@/lib/daily/saved-motion-test";

/** Presentation only: the canonical Daily and Welcome Hall keep their own state. */
export function DailyFrassy({ openSignal, onOpen }: { openSignal: number; onOpen: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const [settled, setSettled] = useState(false);
  const [docked, setDocked] = useState(false);
  const { userId } = useAuthUserId();
  const motion = useQuery(dailyMotionTestOptions(userId));

  useEffect(() => {
    if (!settled) return;
    const timer = window.setTimeout(() => setDocked(true), 900);
    return () => window.clearTimeout(timer);
  }, [settled]);

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
        {docked && motion.data ? <SettledMotion key={`${userId}:${motion.data}`} url={motion.data} /> : null}
      </Button>
      <div id="daily-frassy-conversation">
        <FrassyChat tone="light" hideBeacon workspaceContext="The Daily — help me with today's real work while I stay in my Daily." presentation="daily" openSignal={openSignal} />
      </div>
    </>
  );
}

/** Keep the exact static original visible until actual playback succeeds. */
function SettledMotion({ url }: { url: string }) {
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (playing) return;
    const timer = window.setTimeout(() => setFailed(true), 12000);
    return () => window.clearTimeout(timer);
  }, [playing]);
  if (failed) return null;
  return <video
    data-daily-motion="ivory-test"
    className={`daily-frassy-motion ${playing ? "is-playing" : ""}`}
    src={url}
    width={480}
    height={480}
    aria-hidden="true"
    autoPlay muted playsInline loop
    onPlaying={() => setPlaying(true)}
    onError={() => setFailed(true)}
  />;
}