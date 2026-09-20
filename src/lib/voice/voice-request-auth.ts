// Browser-side helper: attaches the signed-in person's token to voice requests
// so the server can bind a paid speech call to a real account.
import { supabase } from "@/integrations/supabase/client";

export async function voiceAuthHeaders(): Promise<Record<string, string>> {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}
