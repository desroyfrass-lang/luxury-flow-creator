CREATE TABLE public.builder_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  kind text NOT NULL DEFAULT 'idea',
  stage text NOT NULL DEFAULT 'spotted',
  potential_value numeric,
  currency text NOT NULL DEFAULT 'USD',
  effort text NOT NULL DEFAULT 'medium',
  target_date date,
  next_step text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.builder_opportunities TO authenticated;
GRANT ALL ON public.builder_opportunities TO service_role;
ALTER TABLE public.builder_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Builders manage their own opportunities"
  ON public.builder_opportunities FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.builder_finance_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  entry_type text NOT NULL DEFAULT 'income',
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  category text,
  occurred_on date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.builder_finance_entries TO authenticated;
GRANT ALL ON public.builder_finance_entries TO service_role;
ALTER TABLE public.builder_finance_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Builders manage their own finance entries"
  ON public.builder_finance_entries FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_builder_opportunities_user ON public.builder_opportunities(user_id, created_at DESC);
CREATE INDEX idx_builder_finance_user ON public.builder_finance_entries(user_id, occurred_on DESC);

CREATE TRIGGER update_builder_opportunities_updated_at
  BEFORE UPDATE ON public.builder_opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_builder_finance_entries_updated_at
  BEFORE UPDATE ON public.builder_finance_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();