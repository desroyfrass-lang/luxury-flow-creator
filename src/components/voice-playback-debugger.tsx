import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { unlockAudioVerified } from "@/lib/audio-unlock";
import {
  detectOutputDevice,
  getPlaybackDiagnostics,
  subscribePlaybackDiagnostics,
  updatePlaybackDiagnostics,
  type DiagnosticState,
} from "@/lib/voice/playback-diagnostics";
import { StreamingGatewayVoice } from "@/lib/voice/streaming-voice";

const TEST_LINE = "Hello Nicky. If you can hear this, your audio output is working correctly.";

function Status({ value }: { value: DiagnosticState }) {
  return <span>{value === "ok" ? "✅" : value === "failed" ? "❌" : value === "active" ? "●" : "—"}</span>;
}

export function VoicePlaybackDebugger({
  microphone,
  sttConnected,
  transcriptProduced,
  llmResponseReceived,
}: {
  microphone?: boolean;
  sttConnected?: boolean;
  transcriptProduced?: boolean;
  llmResponseReceived?: boolean;
}) {
  const [data, setData] = useState(getPlaybackDiagnostics());
  const [testing, setTesting] = useState(false);

  useEffect(() => subscribePlaybackDiagnostics(setData), []);
  useEffect(() => {
    updatePlaybackDiagnostics({
      microphone: microphone === undefined ? "waiting" : microphone ? "ok" : "failed",
      sttConnected: sttConnected === undefined ? "waiting" : sttConnected ? "ok" : "failed",
      transcriptProduced: transcriptProduced === undefined ? "waiting" : transcriptProduced ? "ok" : "failed",
      llmResponseReceived: llmResponseReceived === undefined ? "waiting" : llmResponseReceived ? "ok" : "failed",
    });
  }, [microphone, sttConnected, transcriptProduced, llmResponseReceived]);
  useEffect(() => {
    void detectOutputDevice();
  }, []);

  const rows: Array<[string, DiagnosticState]> = [
    ["Microphone", data.microphone],
    ["STT Connected", data.sttConnected],
    ["Transcript Produced", data.transcriptProduced],
    ["LLM Response Received", data.llmResponseReceived],
    ["TTS Request Sent", data.ttsRequestSent],
    ["Audio Stream Received", data.audioStreamReceived],
    ["PCM Chunks Decoded", data.pcmChunksDecoded],
    ["Chunks Queued", data.chunksQueued],
    ["Destination Connected", data.destinationConnected],
    ["Playback Started", data.playbackStarted],
    ["Playback Completed", data.playbackCompleted],
  ];

  return (
    <details className="border-t border-border bg-secondary/40 px-4 py-3" open>
      <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--gold)]">
        Voice playback proof · development mode
      </summary>
      <button
        type="button"
        disabled={testing}
        onClick={async () => {
          setTesting(true);
          const unlocked = await unlockAudioVerified();
          if (!unlocked) {
            updatePlaybackDiagnostics({ autoplayState: "blocked" });
            setTesting(false);
            return;
          }
          try {
            const voice = new StreamingGatewayVoice();
            await voice.speak({
              text: TEST_LINE,
              voice: "shimmer",
              instructions: "Speak clearly, warmly, and at a measured pace.",
              speed: 0.95,
            });
          } finally {
            setTesting(false);
          }
        }}
        className="mt-3 inline-flex items-center gap-2 rounded-sm bg-[color:var(--gold)] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-background disabled:opacity-60"
      >
        <Volume2 className="h-4 w-4" /> {testing ? "Testing speaker…" : "Test Speaker"}
      </button>

      <div className="mt-4 grid gap-4 font-mono text-[10px] sm:grid-cols-2">
        <div className="space-y-1">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4">
              <span className="text-muted-foreground">{label}</span><Status value={value} />
            </div>
          ))}
        </div>
        <div className="space-y-1">
          <div>AudioContext: {data.audioContextState}</div>
          <div>Autoplay: {data.autoplayState}</div>
          <div className="break-words">Output: {data.outputDevice}</div>
          <div>Gain: {data.gainLevel.toFixed(2)}</div>
          <div>PCM buffer: {data.pcmBufferBytes} bytes</div>
          <div>Queue: {data.queueLength} chunk(s)</div>
          <div>Sample rate: {data.sampleRate} Hz</div>
          <div>Output latency: {data.outputLatencyMs === null ? "unavailable" : `${data.outputLatencyMs} ms`}</div>
          <div>Playback position: {data.playbackPosition.toFixed(3)} s</div>
        </div>
      </div>
      <div className="mt-3 rounded-sm border border-border p-3 font-mono text-[10px]">
        <div className="font-bold text-foreground">Verification timeline</div>
        {(["ttsGenerated", "pcmReceived", "pcmDecoded", "pcmQueued", "pcmPlayed"] as const).map((key) => (
          <div key={key} className="mt-1 flex justify-between gap-3">
            <span className="text-muted-foreground">{key.replace(/([A-Z])/g, " $1")}</span>
            <span>{data.timestamps[key] ?? "—"}</span>
          </div>
        ))}
      </div>
      {data.firstFailure && (
        <p className="mt-3 text-xs font-bold text-destructive">First failing stage: {data.firstFailure}</p>
      )}
    </details>
  );
}