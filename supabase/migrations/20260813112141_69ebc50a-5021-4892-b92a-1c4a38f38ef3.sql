CREATE TABLE public.member_success_blueprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_name text NOT NULL,
  relationship text,
  blueprint_kind text NOT NULL DEFAULT 'entrepreneurial',
  financial_urgency text,
  long_term_vision text,
  strengths text[] NOT NULL DEFAULT '{}',
  technology_comfort text NOT NULL DEFAULT 'moderate',
  communication_style text,
  daily_priorities text[] NOT NULL DEFAULT '{}',
  money_moves_philosophy text,
  business_vaults text[] NOT NULL DEFAULT '{}',
  learning_style text,
  motivation_style text,
  simplified_view boolean NOT NULL DEFAULT false,
  accessibility_notes text,
  online_first boolean NOT NULL DEFAULT true,
  avoid text[] NOT NULL DEFAULT '{}',
  hours_per_day numeric(4,1),
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT member_success_blueprints_kind_chk CHECK (blueprint_kind IN ('entrepreneurial','knowledge-economy','tradesperson')),
  CONSTRAINT member_success_blueprints_tech_chk CHECK (technology_comfort IN ('low','moderate','high')),
  CONSTRAINT member_success_blueprints_status_chk CHECK (status IN ('draft','active','archived')),
  CONSTRAINT member_success_blueprints_hours_chk CHECK (hours_per_day IS NULL OR (hours_per_day >= 0 AND hours_per_day <= 24))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_success_blueprints TO authenticated;
GRANT ALL ON public.member_success_blueprints TO service_role;

ALTER TABLE public.member_success_blueprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read their own blueprint"
  ON public.member_success_blueprints FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members create blueprints they own"
  ON public.member_success_blueprints FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by AND (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Members update their own blueprint"
  ON public.member_success_blueprints FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete blueprints"
  ON public.member_success_blueprints FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER member_success_blueprints_updated_at
  BEFORE UPDATE ON public.member_success_blueprints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX member_success_blueprints_user_idx ON public.member_success_blueprints(user_id);