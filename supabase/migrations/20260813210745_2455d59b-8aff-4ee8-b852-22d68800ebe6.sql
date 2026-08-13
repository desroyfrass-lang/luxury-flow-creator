CREATE TABLE public.founder_seed_vaults (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  kind TEXT NOT NULL DEFAULT 'vault',
  origin_persona TEXT,
  origin_session TEXT,
  status TEXT NOT NULL DEFAULT 'seed',
  transferred_to TEXT,
  price_cents INTEGER,
  academy_path_title TEXT,
  protected BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT founder_seed_vaults_status_check CHECK (status IN ('seed','published','monetized','academy_path','transferred'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.founder_seed_vaults TO authenticated;
GRANT ALL ON public.founder_seed_vaults TO service_role;

ALTER TABLE public.founder_seed_vaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view their seed vaults"
  ON public.founder_seed_vaults FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owners create their seed vaults"
  ON public.founder_seed_vaults FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners update their seed vaults"
  ON public.founder_seed_vaults FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners delete only unprotected seed vaults"
  ON public.founder_seed_vaults FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND protected = false);

CREATE INDEX idx_founder_seed_vaults_user ON public.founder_seed_vaults (user_id, created_at DESC);

CREATE TRIGGER update_founder_seed_vaults_updated_at
  BEFORE UPDATE ON public.founder_seed_vaults
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();