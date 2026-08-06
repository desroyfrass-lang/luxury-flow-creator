export type TranscriptSource = "User" | "Assistant Echo" | "Noise" | "Discarded" | "—";

export function ConversationIntegrityOverlay({
  state,
  microphone,
  stt,
  tts,
  conversationId,
  turnId,
  speaker,
  lastUserAt,
  lastAssistantAt,
  transcript,
  source,
}: {
  state: string;
  microphone: boolean;
  stt: boolean;
  tts: boolean;
  conversationId: string;
  turnId: number;
  speaker: "Builder" | "Frassy" | "None";
  lastUserAt: string | null;
  lastAssistantAt: string | null;
  transcript: string;
  source: TranscriptSource;
}) {
  return (
    <details className="border-b border-border bg-secondary/30 px-4 py-3">
      <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--gold)]">
        Conversation integrity · temporary
      </summary>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px]">
        <div>State: {state}</div>
        <div>Speaker: {speaker}</div>
        <div>Microphone: {microphone ? "active" : "off"}</div>
        <div>STT: {stt ? "active" : "off"}</div>
        <div>TTS: {tts ? "active" : "off"}</div>
        <div>Turn: {turnId}</div>
        <div className="col-span-2 break-all">Conversation: {conversationId}</div>
        <div className="col-span-2">Last user: {lastUserAt ?? "—"}</div>
        <div className="col-span-2">Last assistant: {lastAssistantAt ?? "—"}</div>
        <div className="col-span-2 break-words">Last transcript: {transcript || "—"}</div>
        <div className="col-span-2">Source: {source}</div>
      </dl>
    </details>
  );
}