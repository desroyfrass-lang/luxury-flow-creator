DROP POLICY IF EXISTS "Members can view their vaults" ON public.vaults;
CREATE POLICY "Owners and members can view their vaults"
ON public.vaults FOR SELECT TO authenticated
USING (owner_id = auth.uid() OR public.can_view_vault(id, auth.uid()));