-- Privileged roles (admin, super_admin) change only through founder_set_role, by a super_admin.
CREATE OR REPLACE FUNCTION public.guard_privileged_roles()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE r public.app_role := CASE WHEN TG_OP = 'DELETE' THEN OLD.role ELSE NEW.role END;
BEGIN
  IF TG_OP = 'UPDATE' AND (OLD.role IN ('admin','super_admin') OR NEW.role IN ('admin','super_admin')) THEN
    RAISE EXCEPTION 'Privileged roles cannot be edited in place';
  END IF;
  IF r IN ('admin','super_admin')
     AND coalesce(current_setting('frass.role_change', true), '') <> 'on'
     AND current_user NOT IN ('postgres','supabase_admin') THEN
    RAISE EXCEPTION 'Privileged roles change only through the Founder role function';
  END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END $$;

DROP TRIGGER IF EXISTS user_roles_guard_privileged ON public.user_roles;
CREATE TRIGGER user_roles_guard_privileged BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.guard_privileged_roles();

CREATE OR REPLACE FUNCTION public.founder_set_role(_user_id uuid, _role public.app_role, _grant boolean, _note text DEFAULT '')
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE uid uuid := auth.uid(); is_super boolean; is_admin boolean; n int; changed int := 0;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  is_super := public.has_role(uid, 'super_admin');
  is_admin := public.has_role(uid, 'admin');
  IF NOT (is_super OR is_admin) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF _role IN ('admin','super_admin') AND NOT is_super THEN
    RAISE EXCEPTION 'Only the Founder (super admin) can change admin or super admin roles';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id) THEN RAISE EXCEPTION 'Unknown account'; END IF;

  PERFORM pg_advisory_xact_lock(hashtext('frass.user_roles'));
  PERFORM set_config('frass.role_change', 'on', true);
  IF _grant THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (_user_id, _role) ON CONFLICT (user_id, role) DO NOTHING;
    GET DIAGNOSTICS changed = ROW_COUNT;
  ELSE
    IF _role = 'super_admin' THEN
      SELECT count(*) INTO n FROM public.user_roles WHERE role = 'super_admin' AND user_id <> _user_id;
      IF n = 0 THEN RAISE EXCEPTION 'Cannot remove the last super admin'; END IF;
    END IF;
    DELETE FROM public.user_roles WHERE user_id = _user_id AND role = _role;
    GET DIAGNOSTICS changed = ROW_COUNT;
  END IF;
  PERFORM set_config('frass.role_change', '', true);

  IF changed > 0 THEN
    INSERT INTO public.founder_audit_ledger(user_id, card_key, card_number, card_title, card_path, role, content)
    VALUES (uid, 'role-change:' || _user_id || ':' || _role, 0,
            'Role ' || CASE WHEN _grant THEN 'granted' ELSE 'revoked' END || ': ' || _role,
            '/admin/roles', 'user',
            left('Role ' || _role || CASE WHEN _grant THEN ' granted to ' ELSE ' revoked from ' END || _user_id || '. ' || coalesce(_note,''), 20000));
  END IF;
  RETURN jsonb_build_object('changed', changed > 0, 'role', _role, 'grant', _grant);
END $$;

REVOKE ALL ON FUNCTION public.founder_set_role(uuid, public.app_role, boolean, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.founder_set_role(uuid, public.app_role, boolean, text) TO authenticated;
REVOKE ALL ON FUNCTION public.guard_privileged_roles() FROM PUBLIC, anon, authenticated;