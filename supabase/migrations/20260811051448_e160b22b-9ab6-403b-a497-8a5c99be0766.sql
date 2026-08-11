CREATE TABLE public.security_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'financial',
  severity TEXT NOT NULL DEFAULT 'high',
  rule TEXT NOT NULL,
  surface TEXT NOT NULL,
  attempted_value NUMERIC,
  allowed_min NUMERIC,
  allowed_max NUMERIC,
  enforced_value NUMERIC,
  halted BOOLEAN NOT NULL DEFAULT true,
  detail TEXT,
  plain_english TEXT,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.security_alerts TO authenticated;
GRANT ALL ON public.security_alerts TO service_role;

ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders and admins read security alerts"
  ON public.security_alerts
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'super_admin'::app_role)
  );

CREATE INDEX security_alerts_created_at_idx ON public.security_alerts (created_at DESC);
CREATE INDEX security_alerts_rule_idx ON public.security_alerts (rule);