REVOKE EXECUTE ON FUNCTION public.vault_role(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_view_vault(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_manage_vault(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_write_vault(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.vault_role(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_view_vault(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_manage_vault(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_write_vault(uuid, uuid) TO authenticated, service_role;