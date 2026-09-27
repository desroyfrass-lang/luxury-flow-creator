ALTER TABLE public.page_feedback
  ADD COLUMN IF NOT EXISTS tester_status text CHECK (tester_status IN ('works','problem','confused')),
  ADD COLUMN IF NOT EXISTS tester_experience text CHECK (tester_experience IN ('signup_login','welcome_hall','onboarding','daily','workshop','own_data'));
COMMENT ON COLUMN public.page_feedback.tester_status IS 'Step 7: set only by the Tester feedback server function after a live commission check.';