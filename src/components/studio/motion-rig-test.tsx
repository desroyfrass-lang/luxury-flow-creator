import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { buildForecast } from "@/lib/studio/credits";
import { finalizeMotionRigJob, prepareMotionRigJob, runStudioOperation } from "@/lib/studio.functions";
import {
  MOTION_LOOP_SECONDS,
  MOTION_RIG_BUCKET,
  renderIdleBreathing,
  verifyPlayable,
} from "@/lib/studio/motion-rig";
import seatedStudioLook from "@/assets/frassy-fv-studios-seated.png.asset.json";

/**
 * Founder-only commissioning test for the FRASS Native Motion Rig.
 * Goes through the real Studio job path: request → engine routing → render on
 * this device → playback check → private storage → server verification →
 * Assets + Animation Library. The approved picture is only read.
 */
export function MotionRigTest({ projectId }: { projectId: string | null }) {
  const runOp = useServerFn(runStudioOperation);
  const prepare = useServerFn(prepareMotionRigJob);
  const finalize = useServerFn(finalizeMotionRigJob);
  const qc = useQueryClient();
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; note: string } | null>(null);

  const make = useMutation({
    mutationFn: async () => {
      if (!projectId) throw new Error("Open a production first.");
      setResult(null);
      setStatus("Asking the Studio which machine does animation…");
      const forecast = buildForecast("Motion Rig test", [{ key: "ai-animation", qty: MOTION_LOOP_SECONDS }]);
      const queued = await runOp({
        data: {
          projectId,
          request: "TEST — Frassy idle breathing loop, 3 seconds (disposable)",
          label: "Motion Rig test",
          lines: forecast.lines.map((l) => ({ key: l.key, label: l.label, credits: l.credits, qty: l.qty })),
          total: forecast.total,
          seconds: forecast.seconds,
        },
      });
      if (queued.status === "blocked") throw new Error(queued.message);
      const prepared = await prepare({ data: { jobId: queued.jobId } });
      setStatus("Rendering frames on this device…");
      const video = await renderIdleBreathing(seatedStudioLook.url);
      setStatus("Checking the file really plays…");
      const check = await verifyPlayable(video);
      const up = await supabase.storage
        .from(MOTION_RIG_BUCKET)
        .upload(prepared.output, video, { contentType: "video/webm", upsert: false });
      if (up.error) throw new Error(`Saving the motion failed: ${up.error.message}`);
      setStatus("Server is verifying and registering it…");
      const verified = await finalize({
        data: {
          jobId: queued.jobId,
          outputPath: prepared.output,
          outputBytes: video.size,
          durationSeconds: check.durationSeconds,
          width: check.width,
          height: check.height,
          sourceAsset: seatedStudioLook.original_filename,
          processedAt: new Date().toISOString(),
          testWaiver: true,
        },
      });
      const signed = await supabase.storage.from(MOTION_RIG_BUCKET).createSignedUrl(prepared.output, 3600);
      if (!signed.data?.signedUrl) throw new Error("The verified motion could not be opened for preview.");
      return {
        url: signed.data.signedUrl,
        note: `${check.durationSeconds}s · ${check.width}×${check.height} WebM · ${
          verified.waived ? "test — no credits taken" : `${verified.charged} credits charged after verification`
        } · saved to Assets and the Animation Library (not approved for live use)`,
      };
    },
    onSuccess: (r) => {
      setStatus(null);
      setResult(r);
      void qc.invalidateQueries({ queryKey: ["ai-wallet"] });
      void qc.invalidateQueries({ queryKey: ["ai-ledger"] });
    },
    onError: (e: Error) => setStatus(`${e.message} Nothing was charged.`),
  });

  return (
    <section aria-label="Motion Rig test" className="rounded-lg border border-border p-4 sm:col-span-2">
      <p className="font-semibold">Motion Rig test (Founder only)</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Makes a disposable 3-second idle breathing loop from the approved seated Studio Frassy. The live Frassy is not
        changed.
      </p>
      <Button type="button" className="mt-3" disabled={make.isPending || !projectId} onClick={() => make.mutate()}>
        {make.isPending ? "Making…" : "Make test motion"}
      </Button>
      {status ? <p className="mt-2 text-sm" role="status">{status}</p> : null}
      {result ? (
        <div className="mt-3">
          <video
            data-testid="motion-rig-output"
            src={result.url}
            controls
            loop
            muted
            playsInline
            autoPlay
            className="w-full max-w-xs rounded-md"
          />
          <p className="mt-2 text-xs text-muted-foreground">{result.note}</p>
        </div>
      ) : null}
    </section>
  );
}
