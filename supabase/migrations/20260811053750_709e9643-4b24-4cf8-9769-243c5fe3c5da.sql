ALTER TABLE public.security_alerts
  ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS founder_note text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'security_alerts_review_status_check'
  ) THEN
    ALTER TABLE public.security_alerts
      ADD CONSTRAINT security_alerts_review_status_check
      CHECK (review_status IN ('open','reviewing','resolved','ignored'));
  END IF;
END $$;

GRANT SELECT, UPDATE ON public.security_alerts TO authenticated;
GRANT ALL ON public.security_alerts TO service_role;

DROP POLICY IF EXISTS "Founders can triage security alerts" ON public.security_alerts;
CREATE POLICY "Founders can triage security alerts"
ON public.security_alerts
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));