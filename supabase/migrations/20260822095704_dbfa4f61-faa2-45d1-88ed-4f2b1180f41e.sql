CREATE TABLE public.frassy_autonomy_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  autonomy_mode text NOT NULL DEFAULT 'handle_everything'
    CHECK (autonomy_mode IN ('handle_everything','teach_me','work_with_me','advise_only')),
  paused boolean NOT NULL DEFAULT false,
  freedom_number numeric,
  changed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.frassy_autonomy_settings TO authenticated;
GRANT ALL ON public.frassy_autonomy_settings TO service_role;
ALTER TABLE public.frassy_autonomy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners read own autonomy" ON public.frassy_autonomy_settings
  FOR SELECT TO authenticated USING (partner_id = auth.uid());
CREATE POLICY "Partners create own autonomy" ON public.frassy_autonomy_settings
  FOR INSERT TO authenticated WITH CHECK (partner_id = auth.uid());
CREATE POLICY "Partners update own autonomy" ON public.frassy_autonomy_settings
  FOR UPDATE TO authenticated USING (partner_id = auth.uid()) WITH CHECK (partner_id = auth.uid());

CREATE TABLE public.frassy_oracle_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  oracle text NOT NULL CHECK (oracle IN ('growth','build','sales','support','financial')),
  move_name text NOT NULL,
  move_type text NOT NULL DEFAULT 'affiliate'
    CHECK (move_type IN ('affiliate','brand_deal','referral','product','service')),
  money_layer text NOT NULL DEFAULT 'immediate_income'
    CHECK (money_layer IN ('immediate_income','business_builder','financial_freedom')),
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued','executing','complete','presented','changes_requested','live','earning','optimizing')),
  progress integer NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  reasoning text,
  frassy_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX frassy_oracle_tasks_partner_idx ON public.frassy_oracle_tasks (partner_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.frassy_oracle_tasks TO authenticated;
GRANT ALL ON public.frassy_oracle_tasks TO service_role;
ALTER TABLE public.frassy_oracle_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners read own tasks" ON public.frassy_oracle_tasks
  FOR SELECT TO authenticated USING (partner_id = auth.uid());
CREATE POLICY "Partners create own tasks" ON public.frassy_oracle_tasks
  FOR INSERT TO authenticated WITH CHECK (partner_id = auth.uid());
CREATE POLICY "Partners update own tasks" ON public.frassy_oracle_tasks
  FOR UPDATE TO authenticated USING (partner_id = auth.uid()) WITH CHECK (partner_id = auth.uid());