CREATE TABLE public.member_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  detail text,
  source_system text NOT NULL DEFAULT 'workshop',
  source_ref text,
  vault_id uuid REFERENCES public.vaults(id) ON DELETE SET NULL,
  context text,
  status text NOT NULL DEFAULT 'active',
  priority smallint NOT NULL DEFAULT 2,
  due_at timestamptz,
  scheduled_for date,
  snoozed_until timestamptz,
  completed_at timestamptz,
  href text,
  is_sample boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_actions TO authenticated;
GRANT ALL ON public.member_actions TO service_role;

ALTER TABLE public.member_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members manage their own work items"
  ON public.member_actions FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE INDEX member_actions_owner_status_idx ON public.member_actions (owner_id, status, updated_at DESC);
CREATE INDEX member_actions_vault_idx ON public.member_actions (vault_id);

CREATE TRIGGER member_actions_updated_at
  BEFORE UPDATE ON public.member_actions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();