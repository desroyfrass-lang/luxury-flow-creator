CREATE OR REPLACE FUNCTION public.expected_platform_allocation(_gross numeric)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT round(COALESCE(_gross, 0) * COALESCE((SELECT p.platform_allocation_rate FROM public.affiliate_policy p LIMIT 1), 10) / 100.0, 2)
$$;

REVOKE EXECUTE ON FUNCTION public.expected_platform_allocation(numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.expected_platform_allocation(numeric) TO authenticated, service_role;

DROP POLICY IF EXISTS "Members record their own receipts" ON public.financial_receipts;
CREATE POLICY "Members record their own receipts"
ON public.financial_receipts
FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    auth.uid() = user_id
    AND status = 'pending'
    AND settled_at IS NULL
    AND external_id IS NULL
    AND COALESCE(gross, 0) >= 0
    AND COALESCE(processing_fee, 0) = 0
    AND COALESCE(other_deductions, 0) = 0
    AND COALESCE(platform_allocation, 0) = public.expected_platform_allocation(COALESCE(gross, 0))
    AND COALESCE(net, 0) = COALESCE(gross, 0) - COALESCE(platform_allocation, 0)
  )
);

DROP POLICY IF EXISTS "Members update their own open receipts" ON public.financial_receipts;
CREATE POLICY "Members update their own open receipts"
ON public.financial_receipts
FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR (auth.uid() = user_id AND status = 'pending')
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    auth.uid() = user_id
    AND status IN ('pending', 'cancelled')
    AND settled_at IS NULL
    AND COALESCE(processing_fee, 0) = 0
    AND COALESCE(other_deductions, 0) = 0
    AND COALESCE(platform_allocation, 0) = public.expected_platform_allocation(COALESCE(gross, 0))
    AND COALESCE(net, 0) = COALESCE(gross, 0) - COALESCE(platform_allocation, 0)
  )
);