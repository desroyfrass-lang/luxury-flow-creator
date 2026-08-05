import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type JourneyStatus = {
  signedIn: boolean;
  /** True when the Builder is signed in and has not finished the Intelligent Builder Journey. */
  needsJourney: boolean;
  started: boolean;
  loading: boolean;
};

/** Reads whether the signed-in Builder still owes the Intelligent Builder Journey. */
export async function fetchJourneyStatus(): Promise<JourneyStatus> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { signedIn: false, needsJourney: false, started: false, loading: false };

  const { data } = await supabase
    .from("builder_journeys")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  const status = data?.status ?? null;
  return {
    signedIn: true,
    needsJourney: status !== "complete",
    started: Boolean(status),
    loading: false,
  };
}

export function useJourneyStatus(): JourneyStatus {
  const [state, setState] = useState<JourneyStatus>({
    signedIn: false,
    needsJourney: false,
    started: false,
    loading: true,
  });

  useEffect(() => {
    let alive = true;
    fetchJourneyStatus()
      .then((s) => {
        if (alive) setState(s);
      })
      .catch(() => {
        if (alive) setState((p) => ({ ...p, loading: false }));
      });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
