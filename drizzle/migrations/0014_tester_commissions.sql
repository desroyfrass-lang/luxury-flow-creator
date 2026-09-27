CREATE TABLE public.tester_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experience text NOT NULL CHECK (experience IN ('signup_login','welcome_hall','onboarding','daily','workshop','own_data')),
  granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, experience)
);
GRANT SELECT ON public.tester_commissions TO authenticated;
GRANT ALL ON public.tester_commissions TO service_role;
ALTER TABLE public.tester_commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Testers read own commissions" ON public.tester_commissions
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Founder reads all commissions" ON public.tester_commissions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
-- No INSERT/UPDATE/DELETE policies: changes only via Founder-verified server functions.

CREATE OR REPLACE FUNCTION public.has_tester_commission(_user_id uuid, _experience text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'tester'::public.app_role)
     AND EXISTS (SELECT 1 FROM public.tester_commissions
                 WHERE user_id = _user_id AND experience = _experience)
$$;
REVOKE EXECUTE ON FUNCTION public.has_tester_commission(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_tester_commission(uuid, text) TO authenticated, service_role;