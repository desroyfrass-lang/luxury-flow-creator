-- 1) ai_credit_wallets: force safe defaults on self-insert
DROP POLICY IF EXISTS "own wallet insert" ON public.ai_credit_wallets;
CREATE POLICY "own wallet insert" ON public.ai_credit_wallets
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND balance = 2000
  AND lifetime_purchased = 0
  AND lifetime_earned = 0
  AND lifetime_gifted = 0
  AND lifetime_used = 0
  AND monthly_allowance = 2000
);

-- 2) studio_operations: read-only for owners; writes only via service role
DROP POLICY IF EXISTS "own studio operations" ON public.studio_operations;
CREATE POLICY "own studio operations read" ON public.studio_operations
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

REVOKE INSERT, UPDATE, DELETE ON public.studio_operations FROM authenticated;
GRANT SELECT ON public.studio_operations TO authenticated;
GRANT ALL ON public.studio_operations TO service_role;