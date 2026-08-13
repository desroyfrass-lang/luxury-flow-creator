-- FRASS-0519 / FRASS-0520 — Founder walkthrough sessions, observations, design changes.

CREATE TABLE public.founder_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  label TEXT NOT NULL DEFAULT 'Founder walkthrough',
  release_ref TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  checklist JSONB NOT NULL DEFAULT '{}'::jsonb,
  report JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.founder_sessions TO authenticated;
GRANT ALL ON public.founder_sessions TO service_role;
ALTER TABLE public.founder_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Founder manages walkthrough sessions"
  ON public.founder_sessions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND user_id = auth.uid());

CREATE TABLE public.founder_observations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.founder_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  step_id TEXT,
  step_label TEXT,
  kind TEXT NOT NULL DEFAULT 'improvement',
  signal TEXT NOT NULL DEFAULT 'neutral',
  note TEXT NOT NULL,
  area TEXT,
  amendment_ref TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.founder_observations TO authenticated;
GRANT ALL ON public.founder_observations TO service_role;
ALTER TABLE public.founder_observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Founder manages observations"
  ON public.founder_observations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND user_id = auth.uid());

CREATE TABLE public.founder_design_changes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  instruction TEXT NOT NULL,
  surface TEXT NOT NULL,
  change_type TEXT NOT NULL,
  reason TEXT,
  before_state JSONB,
  after_state JSONB,
  status TEXT NOT NULL DEFAULT 'preview',
  approved_at TIMESTAMP WITH TIME ZONE,
  reverted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.founder_design_changes TO authenticated;
GRANT ALL ON public.founder_design_changes TO service_role;
ALTER TABLE public.founder_design_changes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Founder manages design changes"
  ON public.founder_design_changes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND user_id = auth.uid());

CREATE TRIGGER update_founder_sessions_updated_at
  BEFORE UPDATE ON public.founder_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_founder_observations_updated_at
  BEFORE UPDATE ON public.founder_observations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_founder_design_changes_updated_at
  BEFORE UPDATE ON public.founder_design_changes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_founder_observations_session ON public.founder_observations(session_id);
CREATE INDEX idx_founder_sessions_user ON public.founder_sessions(user_id, started_at DESC);
CREATE INDEX idx_founder_design_changes_user ON public.founder_design_changes(user_id, created_at DESC);