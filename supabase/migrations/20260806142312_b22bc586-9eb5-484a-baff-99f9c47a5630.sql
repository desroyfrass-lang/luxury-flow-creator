DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT polname FROM pg_policy WHERE polrelid='public.page_feedback'::regclass AND polcmd='a'
  LOOP EXECUTE format('DROP POLICY %I ON public.page_feedback', p.polname); END LOOP;
END $$;

CREATE POLICY "Anyone can submit feedback for themselves"
  ON public.page_feedback FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());