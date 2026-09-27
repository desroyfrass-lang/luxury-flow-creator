CREATE OR REPLACE FUNCTION public.has_tester_commission(_user_id uuid, _experience text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (_user_id = auth.uid() OR auth.role() = 'service_role')
     AND public.has_role(_user_id, 'tester'::public.app_role)
     AND EXISTS (SELECT 1 FROM public.tester_commissions
                 WHERE user_id = _user_id AND experience = _experience)
$$;