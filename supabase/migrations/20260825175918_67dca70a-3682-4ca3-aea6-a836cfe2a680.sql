-- 1. Live tables: anonymous visitors are read-only display audience
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.live_broadcasts FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.live_comments FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.live_gifts FROM anon;

-- 2. frassy_notes: owner policy scoped to authenticated only
DROP POLICY IF EXISTS "Owners manage their own notes" ON public.frassy_notes;
CREATE POLICY "Owners manage their own notes"
ON public.frassy_notes FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
REVOKE ALL ON public.frassy_notes FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.frassy_notes TO authenticated;
GRANT ALL ON public.frassy_notes TO service_role;

-- 3. Email pipeline tables: service role only, enforced by GRANTs as well as policies
REVOKE ALL ON public.email_send_state FROM anon, authenticated;
REVOKE ALL ON public.email_send_log FROM anon, authenticated;
REVOKE ALL ON public.email_unsubscribe_tokens FROM anon, authenticated;
REVOKE ALL ON public.suppressed_emails FROM anon, authenticated;
GRANT ALL ON public.email_send_state TO service_role;
GRANT ALL ON public.email_send_log TO service_role;
GRANT ALL ON public.email_unsubscribe_tokens TO service_role;
GRANT ALL ON public.suppressed_emails TO service_role;

DROP POLICY IF EXISTS "Service role can manage send state" ON public.email_send_state;
CREATE POLICY "Service role can manage send state" ON public.email_send_state
FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can insert send log" ON public.email_send_log;
DROP POLICY IF EXISTS "Service role can read send log" ON public.email_send_log;
DROP POLICY IF EXISTS "Service role can update send log" ON public.email_send_log;
CREATE POLICY "Service role manages send log" ON public.email_send_log
FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can insert tokens" ON public.email_unsubscribe_tokens;
DROP POLICY IF EXISTS "Service role can mark tokens as used" ON public.email_unsubscribe_tokens;
DROP POLICY IF EXISTS "Service role can read tokens" ON public.email_unsubscribe_tokens;
CREATE POLICY "Service role manages unsubscribe tokens" ON public.email_unsubscribe_tokens
FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can insert suppressed emails" ON public.suppressed_emails;
DROP POLICY IF EXISTS "Service role can read suppressed emails" ON public.suppressed_emails;
CREATE POLICY "Service role manages suppressed emails" ON public.suppressed_emails
FOR ALL TO service_role USING (true) WITH CHECK (true);