CREATE TABLE public.repair_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reported_text text NOT NULL,
  context_path text,
  category text NOT NULL DEFAULT 'unknown',
  severity text NOT NULL DEFAULT 'medium',
  diagnosis text,
  root_cause text,
  status text NOT NULL DEFAULT 'open',
  repairs_applied jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  engineering_report text,
  blocking_launch boolean NOT NULL DEFAULT false,
  pattern_signature text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT repair_incidents_status_chk CHECK (status IN ('open','diagnosed','auto_repaired','escalated','resolved')),
  CONSTRAINT repair_incidents_severity_chk CHECK (severity IN ('low','medium','high','critical'))
);

CREATE INDEX repair_incidents_created_idx ON public.repair_incidents (created_at DESC);
CREATE INDEX repair_incidents_user_idx ON public.repair_incidents (user_id);

GRANT SELECT, INSERT ON public.repair_incidents TO authenticated;
GRANT ALL ON public.repair_incidents TO service_role;

ALTER TABLE public.repair_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read their own repair incidents"
  ON public.repair_incidents FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members report their own repair incidents"
  ON public.repair_incidents FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE TABLE public.repair_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signature text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'unknown',
  symptom text NOT NULL,
  root_cause text,
  repair_action text,
  guidance text,
  times_seen integer NOT NULL DEFAULT 1,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.repair_patterns TO authenticated;
GRANT ALL ON public.repair_patterns TO service_role;

ALTER TABLE public.repair_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in members read repair patterns"
  ON public.repair_patterns FOR SELECT TO authenticated
  USING (true);

CREATE TRIGGER update_repair_incidents_updated_at
  BEFORE UPDATE ON public.repair_incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();