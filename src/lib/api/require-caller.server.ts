// ─────────────────────────────────────────────────────────────────────────────
// Requester-bound gate for metered AI routes (server only).
//
// Paid outbound AI calls (speech-out, speech-in) must belong to a real signed-in
// person, never to an anonymous caller who found the address. The token is
// validated with Supabase on every request — a client flag is never trusted.
// ─────────────────────────────────────────────────────────────────────────────

/** Returns the verified user id for a request, or null when there is none. */
export async function verifiedCallerId(request: Request): Promise<string | null> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token || token.split(".").length !== 3) return null;

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supa = createClient(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_PUBLISHABLE_KEY"]!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
    const { data } = await supa.auth.getClaims(token);
    const userId = data?.claims?.sub;
    return typeof userId === "string" && userId ? userId : null;
  } catch {
    return null;
  }
}

export const SIGN_IN_REQUIRED = "Please sign in to use Frassy's voice.";
