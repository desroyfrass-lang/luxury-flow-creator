CREATE TABLE public.ai_credit_wallets (
  user_id UUID NOT NULL PRIMARY KEY,
  balance INTEGER NOT NULL DEFAULT 2000,
  lifetime_purchased INTEGER NOT NULL DEFAULT 0,
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_gifted INTEGER NOT NULL DEFAULT 0,
  lifetime_used INTEGER NOT NULL DEFAULT 0,
  monthly_allowance INTEGER NOT NULL DEFAULT 2000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.ai_credit_wallets TO authenticated;
GRANT ALL ON public.ai_credit_wallets TO service_role;
ALTER TABLE public.ai_credit_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own wallet read" ON public.ai_credit_wallets FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own wallet insert" ON public.ai_credit_wallets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.ai_credit_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('debit','credit')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  operation_key TEXT,
  label TEXT NOT NULL,
  project_id UUID,
  description TEXT,
  processing_ms INTEGER,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ai_credit_ledger_user_idx ON public.ai_credit_ledger (user_id, created_at DESC);
GRANT SELECT ON public.ai_credit_ledger TO authenticated;
GRANT ALL ON public.ai_credit_ledger TO service_role;
ALTER TABLE public.ai_credit_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ledger read" ON public.ai_credit_ledger FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.studio_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  destination TEXT NOT NULL DEFAULT 'youtube',
  status TEXT NOT NULL DEFAULT 'draft',
  brief TEXT,
  timeline JSONB NOT NULL DEFAULT '{"tracks":[]}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studio_projects TO authenticated;
GRANT ALL ON public.studio_projects TO service_role;
ALTER TABLE public.studio_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own studio projects" ON public.studio_projects FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.studio_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.studio_projects(id) ON DELETE CASCADE,
  operation_key TEXT NOT NULL,
  label TEXT NOT NULL,
  request TEXT,
  estimated_credits INTEGER NOT NULL DEFAULT 0,
  actual_credits INTEGER,
  status TEXT NOT NULL DEFAULT 'forecast',
  processing_ms INTEGER,
  output JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX studio_operations_user_idx ON public.studio_operations (user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studio_operations TO authenticated;
GRANT ALL ON public.studio_operations TO service_role;
ALTER TABLE public.studio_operations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own studio operations" ON public.studio_operations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_ai_credit_wallets_updated_at BEFORE UPDATE ON public.ai_credit_wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_studio_projects_updated_at BEFORE UPDATE ON public.studio_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();