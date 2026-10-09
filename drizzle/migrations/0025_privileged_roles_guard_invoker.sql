CREATE OR REPLACE FUNCTION public.guard_privileged_roles()
 RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path TO 'public'
AS $$
DECLARE r public.app_role := CASE WHEN TG_OP = 'DELETE' THEN OLD.role ELSE NEW.role END;
BEGIN
  IF TG_OP = 'UPDATE' AND (OLD.role IN ('admin','super_admin') OR NEW.role IN ('admin','super_admin')) THEN
    RAISE EXCEPTION 'Privileged roles cannot be edited in place';
  END IF;
  -- Invoker rights: current_user is the real caller (authenticated / service_role),
  -- so server code with the service key cannot bypass. Only owner sessions
  -- (reviewed migrations) and founder_set_role may change privileged roles.
  IF r IN ('admin','super_admin')
     AND coalesce(current_setting('frass.role_change', true), '') <> 'on'
     AND current_user NOT IN ('postgres','supabase_admin') THEN
    RAISE EXCEPTION 'Privileged roles change only through the Founder role function';
  END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END $$;
GRANT EXECUTE ON FUNCTION public.guard_privileged_roles() TO authenticated, service_role;