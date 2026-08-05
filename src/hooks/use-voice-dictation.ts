import { useCallback, useEffect, useRef, useState } from "react";

/** Minimal typing for the browser SpeechRecognition API (vendor-prefixed in Chrome/Safari). */
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: any) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    | (new () => SpeechRecognitionLike)
    | null;
}

export type VoiceDictation = {
  supported: boolean;
  listening: boolean;
  interim: string;
  start: () => void;
  stop: () => void;
};

/**
 * Live speech-to-text for talking with Frassy.
 * `onFinal` fires with the completed utterance when the speaker pauses.
 */
export function useVoiceDictation(onFinal: (text: string) => void): VoiceDictation {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const finalRef = useRef(onFinal);
  finalRef.current = onFinal;

  useEffect(() => {
    setSupported(Boolean(getRecognitionCtor()));
    return () => {
      try {
        recRef.current?.abort();
      } catch {
        /* noop */
      }
    };
  }, []);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* noop */
    }
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    try {
      recRef.current?.abort();
    } catch {
      /* noop */
    }

    const rec = new Ctor();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = true;

    let finalText = "";
    rec.onresult = (e: any) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else live += r[0].transcript;
      }
      setInterim(live);
    };
    rec.onerror = () => {
      setListening(false);
      setInterim("");
    };
    rec.onend = () => {
      setListening(false);
      setInterim("");
      const text = finalText.trim();
      if (text) finalRef.current(text);
    };

    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, []);

  return { supported, listening, interim, start, stop };
}
