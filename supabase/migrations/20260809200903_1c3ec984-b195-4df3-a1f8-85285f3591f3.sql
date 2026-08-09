ALTER TABLE public.live_comments ADD COLUMN IF NOT EXISTS author_handle TEXT;
ALTER TABLE public.live_gifts ADD COLUMN IF NOT EXISTS sender_handle TEXT;

GRANT SELECT (author_handle) ON public.live_comments TO anon, authenticated;
GRANT INSERT (author_handle) ON public.live_comments TO authenticated;
GRANT SELECT (sender_handle) ON public.live_gifts TO anon, authenticated;
GRANT INSERT (sender_handle) ON public.live_gifts TO authenticated;