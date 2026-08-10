-- FRASS-0448 Financial Authority Constitution
-- Clients may REQUEST financial actions; only the trusted backend AUTHORIZES them.

-- 1. New receipts from members must start unsettled, with backend-recomputed math.
CREATE OR REPLACE FUNCTION public.enforce_receipt_creation_authority()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Trusted backend (service_role / no session) and admins are unaffected.
  IF auth.uid() IS NULL
     OR public.has_role(auth.uid(), 'admin'::app_role)
     OR public.has_role(auth.uid(), 'super_admin'::app_role) THEN
    RETURN NEW;
  END IF;

  NEW.user_id := auth.uid();
  NEW.status := 'pending';
  NEW.settled_at := NULL;
  NEW.external_id := NULL;

  IF COALESCE(NEW.gross, 0) < 0
     OR COALESCE(NEW.platform_allocation, 0) < 0
     OR COALESCE(NEW.processing_fee, 0) < 0
     OR COALESCE(NEW.other_deductions, 0) < 0 THEN
    RAISE EXCEPTION 'Financial amounts cannot be negative.';
  END IF;

  -- Net is computed, never asserted by the client.
  NEW.net := COALESCE(NEW.gross, 0)
           - COALESCE(NEW.platform_allocation, 0)
           - COALESCE(NEW.processing_fee, 0)
           - COALESCE(NEW.other_deductions, 0);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS financial_receipts_creation_authority ON public.financial_receipts;
CREATE TRIGGER financial_receipts_creation_authority
BEFORE INSERT ON public.financial_receipts
FOR EACH ROW EXECUTE FUNCTION public.enforce_receipt_creation_authority();

-- 2. New payment requests must start unpaid, and may never be deleted by a client.
CREATE OR REPLACE FUNCTION public.enforce_payment_request_creation_authority()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL
     OR public.has_role(auth.uid(), 'admin'::app_role)
     OR public.has_role(auth.uid(), 'super_admin'::app_role) THEN
    RETURN NEW;
  END IF;

  NEW.seller_id := auth.uid();

  IF NEW.status IS NULL OR NEW.status NOT IN ('preparing', 'awaiting_approval') THEN
    NEW.status := 'awaiting_approval';
  END IF;

  NEW.paid_at := NULL;
  NEW.order_id := NULL;
  NEW.declined_at := NULL;
  NEW.refunded_at := NULL;
  NEW.cancelled_at := NULL;
  NEW.expired_at := NULL;
  NEW.processing_started_at := NULL;
  NEW.first_viewed_at := NULL;
  NEW.attempts := 0;

  IF COALESCE(NEW.amount, 0) <= 0 THEN
    RAISE EXCEPTION 'A payment request must have a positive amount.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS payment_requests_creation_authority ON public.payment_requests;
CREATE TRIGGER payment_requests_creation_authority
BEFORE INSERT ON public.payment_requests
FOR EACH ROW EXECUTE FUNCTION public.enforce_payment_request_creation_authority();

-- 3. Replace the blanket ALL policy so clients cannot delete financial records.
DROP POLICY IF EXISTS "Sellers manage their own payment requests" ON public.payment_requests;

CREATE POLICY "Sellers read their own payment requests"
ON public.payment_requests FOR SELECT TO authenticated
USING (auth.uid() = seller_id);

CREATE POLICY "Sellers create their own payment requests"
ON public.payment_requests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers update their own payment requests"
ON public.payment_requests FOR UPDATE TO authenticated
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

-- 4. Financial records are permanent: no client deletes anywhere in the ledger.
REVOKE DELETE ON public.payment_requests FROM authenticated;
REVOKE DELETE ON public.financial_receipts FROM authenticated;
REVOKE DELETE ON public.card_orders FROM authenticated;