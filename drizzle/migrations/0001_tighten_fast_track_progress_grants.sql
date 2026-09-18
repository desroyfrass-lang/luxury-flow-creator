-- Fast Track progress is private Builder work. No public/anon exposure.
REVOKE ALL ON public.fast_track_progress FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fast_track_progress TO authenticated;
GRANT ALL ON public.fast_track_progress TO service_role;