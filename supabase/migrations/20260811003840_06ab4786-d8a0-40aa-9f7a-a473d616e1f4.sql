CREATE TABLE public.partner_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  designation text NOT NULL DEFAULT 'first_partner',
  display_name text,
  note text,
  invited_by uuid,
  claimed_by uuid,
  claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.partner_invitations TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.partner_invitations TO authenticated;
GRANT ALL ON public.partner_invitations TO service_role;

ALTER TABLE public.partner_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invitee can read their own invitation"
ON public.partner_invitations FOR SELECT TO authenticated
USING (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Admins create invitations"
ON public.partner_invitations FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Admins update invitations"
ON public.partner_invitations FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Admins delete invitations"
ON public.partner_invitations FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE OR REPLACE FUNCTION public.claim_partner_invitation()
RETURNS TABLE(designation text, display_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv public.partner_invitations%ROWTYPE;
  em text;
  verified timestamptz;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  SELECT u.email_confirmed_at, lower(u.email) INTO verified, em
  FROM auth.users u WHERE u.id = auth.uid();

  IF em IS NULL OR em = '' OR verified IS NULL THEN
    RETURN;
  END IF;

  SELECT * INTO inv FROM public.partner_invitations WHERE lower(email) = em LIMIT 1;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF inv.claimed_by IS NULL THEN
    UPDATE public.partner_invitations
       SET claimed_by = auth.uid(), claimed_at = now()
     WHERE id = inv.id;
  ELSIF inv.claimed_by <> auth.uid() THEN
    RETURN;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'partner'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  designation := inv.designation;
  display_name := inv.display_name;
  RETURN NEXT;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_partner_invitation() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_partner_invitation() TO authenticated;