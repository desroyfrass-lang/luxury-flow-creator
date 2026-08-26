CREATE TABLE public.vaults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  subtype text,
  description text,
  status text NOT NULL DEFAULT 'setup_in_progress',
  setup_step text NOT NULL DEFAULT 'interview',
  setup_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  enabled_modules text[] NOT NULL DEFAULT ARRAY[]::text[],
  hidden_modules text[] NOT NULL DEFAULT ARRAY[]::text[],
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.vault_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id uuid NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (vault_id, user_id)
);

CREATE TABLE public.vault_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id uuid NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
  module_id text NOT NULL,
  title text NOT NULL,
  body text,
  status text NOT NULL DEFAULT 'open',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  due_at timestamptz,
  amount numeric,
  created_by uuid NOT NULL,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.vault_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id uuid NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
  actor_id uuid,
  kind text NOT NULL,
  summary text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_vaults_owner ON public.vaults(owner_id);
CREATE INDEX idx_vault_members_user ON public.vault_members(user_id);
CREATE INDEX idx_vault_records_vault_module ON public.vault_records(vault_id, module_id);
CREATE INDEX idx_vault_activity_vault ON public.vault_activity(vault_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vaults TO authenticated;
GRANT ALL ON public.vaults TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vault_members TO authenticated;
GRANT ALL ON public.vault_members TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vault_records TO authenticated;
GRANT ALL ON public.vault_records TO service_role;
GRANT SELECT, INSERT ON public.vault_activity TO authenticated;
GRANT ALL ON public.vault_activity TO service_role;

CREATE OR REPLACE FUNCTION public.vault_role(_vault_id uuid, _user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.vaults v WHERE v.id = _vault_id AND v.owner_id = _user_id)
      THEN 'owner'
    ELSE (SELECT m.role FROM public.vault_members m WHERE m.vault_id = _vault_id AND m.user_id = _user_id)
  END
$$;

CREATE OR REPLACE FUNCTION public.can_view_vault(_vault_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$ SELECT public.vault_role(_vault_id, _user_id) IS NOT NULL $$;

CREATE OR REPLACE FUNCTION public.can_manage_vault(_vault_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$ SELECT public.vault_role(_vault_id, _user_id) IN ('owner','admin') $$;

CREATE OR REPLACE FUNCTION public.can_write_vault(_vault_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$ SELECT public.vault_role(_vault_id, _user_id) IN ('owner','admin','member','collaborator') $$;

REVOKE EXECUTE ON FUNCTION public.vault_role(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_view_vault(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_manage_vault(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_write_vault(uuid, uuid) FROM anon;

ALTER TABLE public.vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their vaults" ON public.vaults
  FOR SELECT TO authenticated USING (public.can_view_vault(id, auth.uid()));
CREATE POLICY "Users create their own vaults" ON public.vaults
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners and admins update the vault" ON public.vaults
  FOR UPDATE TO authenticated USING (public.can_manage_vault(id, auth.uid()))
  WITH CHECK (public.can_manage_vault(id, auth.uid()));
CREATE POLICY "Only the owner deletes the vault" ON public.vaults
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Members can see the member list" ON public.vault_members
  FOR SELECT TO authenticated USING (public.can_view_vault(vault_id, auth.uid()));
CREATE POLICY "Managers add members" ON public.vault_members
  FOR INSERT TO authenticated WITH CHECK (public.can_manage_vault(vault_id, auth.uid()));
CREATE POLICY "Managers update members" ON public.vault_members
  FOR UPDATE TO authenticated USING (public.can_manage_vault(vault_id, auth.uid()))
  WITH CHECK (public.can_manage_vault(vault_id, auth.uid()));
CREATE POLICY "Managers remove members" ON public.vault_members
  FOR DELETE TO authenticated USING (public.can_manage_vault(vault_id, auth.uid()));

CREATE POLICY "Members read vault records" ON public.vault_records
  FOR SELECT TO authenticated USING (public.can_view_vault(vault_id, auth.uid()));
CREATE POLICY "Contributors create vault records" ON public.vault_records
  FOR INSERT TO authenticated
  WITH CHECK (public.can_write_vault(vault_id, auth.uid()) AND created_by = auth.uid());
CREATE POLICY "Contributors update vault records" ON public.vault_records
  FOR UPDATE TO authenticated USING (public.can_write_vault(vault_id, auth.uid()))
  WITH CHECK (public.can_write_vault(vault_id, auth.uid()));
CREATE POLICY "Contributors delete vault records" ON public.vault_records
  FOR DELETE TO authenticated USING (public.can_write_vault(vault_id, auth.uid()));

CREATE POLICY "Members read vault activity" ON public.vault_activity
  FOR SELECT TO authenticated USING (public.can_view_vault(vault_id, auth.uid()));
CREATE POLICY "Members write vault activity" ON public.vault_activity
  FOR INSERT TO authenticated
  WITH CHECK (public.can_view_vault(vault_id, auth.uid()) AND (actor_id IS NULL OR actor_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_vaults_updated_at BEFORE UPDATE ON public.vaults
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vault_members_updated_at BEFORE UPDATE ON public.vault_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vault_records_updated_at BEFORE UPDATE ON public.vault_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();