CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.vault_role(_vault_id uuid, _user_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.vaults v WHERE v.id = _vault_id AND v.owner_id = _user_id)
      THEN 'owner'
    ELSE (SELECT m.role FROM public.vault_members m WHERE m.vault_id = _vault_id AND m.user_id = _user_id)
  END
$$;

CREATE OR REPLACE FUNCTION private.can_view_vault(_vault_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT private.vault_role(_vault_id, _user_id) IS NOT NULL $$;

CREATE OR REPLACE FUNCTION private.can_write_vault(_vault_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT private.vault_role(_vault_id, _user_id) IN ('owner','admin','member','collaborator') $$;

CREATE OR REPLACE FUNCTION private.can_manage_vault(_vault_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT private.vault_role(_vault_id, _user_id) IN ('owner','admin') $$;

REVOKE ALL ON FUNCTION private.vault_role(uuid,uuid), private.can_view_vault(uuid,uuid), private.can_write_vault(uuid,uuid), private.can_manage_vault(uuid,uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.vault_role(uuid,uuid), private.can_view_vault(uuid,uuid), private.can_write_vault(uuid,uuid), private.can_manage_vault(uuid,uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Owners and members can view their vaults" ON public.vaults;
DROP POLICY IF EXISTS "Owners and admins update the vault" ON public.vaults;
CREATE POLICY "Owners and members can view their vaults" ON public.vaults FOR SELECT TO authenticated
USING (owner_id = auth.uid() OR private.can_view_vault(id, auth.uid()));
CREATE POLICY "Owners and admins update the vault" ON public.vaults FOR UPDATE TO authenticated
USING (private.can_manage_vault(id, auth.uid())) WITH CHECK (private.can_manage_vault(id, auth.uid()));

DROP POLICY IF EXISTS "Members can see the member list" ON public.vault_members;
DROP POLICY IF EXISTS "Managers add members" ON public.vault_members;
DROP POLICY IF EXISTS "Managers update members" ON public.vault_members;
DROP POLICY IF EXISTS "Managers remove members" ON public.vault_members;
CREATE POLICY "Members can see the member list" ON public.vault_members FOR SELECT TO authenticated
USING (private.can_view_vault(vault_id, auth.uid()));
CREATE POLICY "Managers add members" ON public.vault_members FOR INSERT TO authenticated
WITH CHECK (private.can_manage_vault(vault_id, auth.uid()));
CREATE POLICY "Managers update members" ON public.vault_members FOR UPDATE TO authenticated
USING (private.can_manage_vault(vault_id, auth.uid())) WITH CHECK (private.can_manage_vault(vault_id, auth.uid()));
CREATE POLICY "Managers remove members" ON public.vault_members FOR DELETE TO authenticated
USING (private.can_manage_vault(vault_id, auth.uid()));

DROP POLICY IF EXISTS "Members read vault records" ON public.vault_records;
DROP POLICY IF EXISTS "Contributors create vault records" ON public.vault_records;
DROP POLICY IF EXISTS "Contributors update vault records" ON public.vault_records;
DROP POLICY IF EXISTS "Contributors delete vault records" ON public.vault_records;
CREATE POLICY "Members read vault records" ON public.vault_records FOR SELECT TO authenticated
USING (private.can_view_vault(vault_id, auth.uid()));
CREATE POLICY "Contributors create vault records" ON public.vault_records FOR INSERT TO authenticated
WITH CHECK (private.can_write_vault(vault_id, auth.uid()) AND created_by = auth.uid());
CREATE POLICY "Contributors update vault records" ON public.vault_records FOR UPDATE TO authenticated
USING (private.can_write_vault(vault_id, auth.uid())) WITH CHECK (private.can_write_vault(vault_id, auth.uid()));
CREATE POLICY "Contributors delete vault records" ON public.vault_records FOR DELETE TO authenticated
USING (private.can_write_vault(vault_id, auth.uid()));

DROP POLICY IF EXISTS "Members read vault activity" ON public.vault_activity;
DROP POLICY IF EXISTS "Members write vault activity" ON public.vault_activity;
CREATE POLICY "Members read vault activity" ON public.vault_activity FOR SELECT TO authenticated
USING (private.can_view_vault(vault_id, auth.uid()));
CREATE POLICY "Members write vault activity" ON public.vault_activity FOR INSERT TO authenticated
WITH CHECK (private.can_view_vault(vault_id, auth.uid()) AND (actor_id IS NULL OR actor_id = auth.uid()));

DROP FUNCTION IF EXISTS public.can_view_vault(uuid,uuid);
DROP FUNCTION IF EXISTS public.can_write_vault(uuid,uuid);
DROP FUNCTION IF EXISTS public.can_manage_vault(uuid,uuid);
DROP FUNCTION IF EXISTS public.vault_role(uuid,uuid);