import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import dailyOriginal from "@/assets/frassy-daily-seated-exact-original.png.asset.json";

/** The single disposable, verified ivory-source test; never commission here. */
export const DAILY_MOTION_TEST = {
  assetId: "c999a3c6-ef8b-42da-94be-22ebdfd3556e",
  path: "1ca650de-7e5d-4dfa-8938-0193505dc8d5/3cb7d0bb-b13f-4457-ba17-987d8f14e086/idle-breathing.webm",
  bucket: "studio-motion",
} as const;

export const dailyMotionTestOptions = (userId: string | null) => queryOptions({
  queryKey: ["daily-motion-test", userId, DAILY_MOTION_TEST.assetId],
  enabled: Boolean(userId),
  gcTime: 0,
  staleTime: 30 * 60 * 1000,
  refetchInterval: 30 * 60 * 1000,
  retry: false,
  queryFn: async () => {
    if (!userId) return null;
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || auth.user?.id !== userId) return null;
    // Authenticated owner read + existing RLS; identifiers confer no access.
    const { data, error } = await supabase.from("studio_assets")
      .select("id,file_url,approved,generation_info")
      .eq("id", DAILY_MOTION_TEST.assetId)
      .eq("created_by", userId)
      .eq("approved", false)
      .contains("generation_info", {
        source_asset: dailyOriginal.original_filename,
        test: true,
        engine_slug: "frass_motion_rig_v1",
      })
      .maybeSingle();
    if (error || data?.file_url !== DAILY_MOTION_TEST.path) return null;
    const { data: signed, error: signError } = await supabase.storage
      .from(DAILY_MOTION_TEST.bucket).createSignedUrl(data.file_url, 3600);
    return signError ? null : signed?.signedUrl ?? null;
  },
});