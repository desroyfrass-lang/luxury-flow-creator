// FRASS-0553 — the one channel between the Frassy Conversation Dock and the
// single conversation surface (FrassyChat). The dock never owns the mic; it
// simply asks the conversation to start listening, wherever the member is.

export const TALK_EVENT = "frassy:dock-talk";

/** Ask Frassy to open and start (or finish) a spoken turn. */
export function requestTalk(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(TALK_EVENT));
}

/** Subscribe the active conversation surface to dock talk requests. */
export function onTalkRequest(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(TALK_EVENT, handler);
  return () => window.removeEventListener(TALK_EVENT, handler);
}
