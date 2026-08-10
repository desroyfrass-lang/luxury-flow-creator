-- card_orders: sellers may only move orders to cancelled/refunded, never edit money
DROP POLICY IF EXISTS "Sellers can update their own card orders" ON public.card_orders;
CREATE POLICY "Sellers can update their own card orders"
ON public.card_orders FOR UPDATE TO authenticated
USING (
  auth.uid() = seller_id
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
  OR (auth.uid() = seller_id AND status IN ('pending','cancelled','refunded'))
);

-- financial_receipts: members may only create pending, unsettled receipts
DROP POLICY IF EXISTS "Members record their own receipts" ON public.financial_receipts;
CREATE POLICY "Members record their own receipts"
ON public.financial_receipts FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    auth.uid() = user_id
    AND status = 'pending'
    AND settled_at IS NULL
    AND external_id IS NULL
    AND COALESCE(gross, 0) >= 0
    AND COALESCE(platform_allocation, 0) >= 0
    AND COALESCE(processing_fee, 0) >= 0
    AND COALESCE(other_deductions, 0) >= 0
  )
);

-- financial_receipts: settled receipts are immutable at the policy layer too
DROP POLICY IF EXISTS "Members update their own open receipts" ON public.financial_receipts;
CREATE POLICY "Members update their own open receipts"
ON public.financial_receipts FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
  OR (auth.uid() = user_id AND status = 'pending')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    auth.uid() = user_id
    AND status IN ('pending','cancelled')
    AND settled_at IS NULL
  )
);

-- payment_requests: sellers may only cancel or expire, never confirm payment
DROP POLICY IF EXISTS "Sellers update their own payment requests" ON public.payment_requests;
CREATE POLICY "Sellers update their own payment requests"
ON public.payment_requests FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
  OR (auth.uid() = seller_id AND status IN ('preparing','awaiting_approval'))
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
  OR (
    auth.uid() = seller_id
    AND status IN ('preparing','awaiting_approval','cancelled','expired')
    AND paid_at IS NULL
    AND order_id IS NULL
  )
);

-- affiliate_links: commission rate must stay inside the published policy bounds
DROP POLICY IF EXISTS "Affiliate updates own links" ON public.affiliate_links;
CREATE POLICY "Affiliate updates own links"
ON public.affiliate_links FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR (
    auth.uid() = user_id
    AND (
      commission_rate IS NULL
      OR EXISTS (
        SELECT 1 FROM public.affiliate_policy p
        WHERE commission_rate >= COALESCE(p.min_commission_rate, 0)
          AND commission_rate <= COALESCE(p.max_commission_rate, 100)
      )
    )
  )
);