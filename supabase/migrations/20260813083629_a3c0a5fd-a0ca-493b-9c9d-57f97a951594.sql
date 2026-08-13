ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS view_mode text NOT NULL DEFAULT 'standard';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_view_mode_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_view_mode_check
      CHECK (view_mode IN ('standard', 'simplified'));
  END IF;
END $$;

COMMENT ON COLUMN public.profiles.view_mode IS
  'FRASS-0517 — platform-wide view preference: standard (full dashboards) or simplified (conversation-first). Presentation only; never changes capability.';