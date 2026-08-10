
-- card_orders: freeze financial columns for sellers, limit status transitions
CREATE OR REPLACE FUNCTION public.protect_card_order_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL
     OR public.has_role(auth.uid(), 'admin'::app_role)
     OR public.has_role(auth.uid(), 'super_admin'::app_role) THEN
    RETURN NEW;
  END IF;

  NEW.id := OLD.id;
  NEW.seller_id := OLD.seller_id;
  NEW.listing_id := OLD.listing_id;
  NEW.quantity := OLD.quantity;
  NEW.unit_price := OLD.unit_price;
  NEW.subtotal := OLD.subtotal;
  NEW.platform_fee := OLD.platform_fee;
  NEW.processing_fee_estimate := OLD.processing_fee_estimate;
  NEW.net_to_seller := OLD.net_to_seller;
  NEW.currency := OLD.currency;
  NEW.payout_provider := OLD.payout_provider;
  NEW.reference := OLD.reference;
  NEW.created_at := OLD.created_at;

  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status NOT IN ('cancelled','refunded') THEN
    RAISE EXCEPTION 'Sellers may only cancel or refund an order. Payment outcomes are recorded by the payment system.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS card_orders_protect_fields ON public.card_orders;
CREATE TRIGGER card_orders_protect_fields
BEFORE UPDATE ON public.card_orders
FOR EACH ROW EXECUTE FUNCTION public.protect_card_order_fields();

-- financial_receipts: members may never move money fields or settle themselves
CREATE OR REPLACE FUNCTION public.protect_receipt_member_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL
     OR public.has_role(auth.uid(), 'admin'::app_role)
     OR public.has_role(auth.uid(), 'super_admin'::app_role) THEN
    RETURN NEW;
  END IF;

  IF OLD.status <> 'pending' THEN
    RAISE EXCEPTION 'Only pending receipts can be edited.';
  END IF;

  NEW.direction := OLD.direction;
  NEW.kind := OLD.kind;
  NEW.source := OLD.source;
  NEW.gross := OLD.gross;
  NEW.platform_allocation := OLD.platform_allocation;
  NEW.processing_fee := OLD.processing_fee;
  NEW.other_deductions := OLD.other_deductions;
  NEW.net := OLD.net;
  NEW.currency := OLD.currency;
  NEW.settled_at := OLD.settled_at;
  NEW.external_id := OLD.external_id;
  NEW.reference := OLD.reference;

  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status <> 'cancelled' THEN
    RAISE EXCEPTION 'Members may only cancel a pending receipt. Settlement is recorded by the payment system.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS financial_receipts_member_guard ON public.financial_receipts;
CREATE TRIGGER financial_receipts_member_guard
BEFORE UPDATE ON public.financial_receipts
FOR EACH ROW EXECUTE FUNCTION public.protect_receipt_member_fields();

-- payment_requests: sellers cannot self-confirm payment or change amounts
CREATE OR REPLACE FUNCTION public.protect_payment_request_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL
     OR public.has_role(auth.uid(), 'admin'::app_role)
     OR public.has_role(auth.uid(), 'super_admin'::app_role) THEN
    RETURN NEW;
  END IF;

  NEW.id := OLD.id;
  NEW.token := OLD.token;
  NEW.seller_id := OLD.seller_id;
  NEW.amount := OLD.amount;
  NEW.quantity := OLD.quantity;
  NEW.currency := OLD.currency;
  NEW.order_id := OLD.order_id;
  NEW.paid_at := OLD.paid_at;
  NEW.idempotency_key := OLD.idempotency_key;
  NEW.attempts := OLD.attempts;
  NEW.first_viewed_at := OLD.first_viewed_at;
  NEW.processing_started_at := OLD.processing_started_at;
  NEW.declined_at := OLD.declined_at;
  NEW.refunded_at := OLD.refunded_at;
  NEW.failure_reason := OLD.failure_reason;
  NEW.created_at := OLD.created_at;

  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status NOT IN ('cancelled','expired') THEN
    RAISE EXCEPTION 'Sellers may only cancel or expire a payment request. Payment confirmation is recorded by the payment system.';
  END IF;

  IF NEW.status = 'cancelled' AND NEW.cancelled_at IS NULL THEN
    NEW.cancelled_at := now();
  END IF;
  IF NEW.status = 'expired' AND NEW.expired_at IS NULL THEN
    NEW.expired_at := now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS payment_requests_protect_fields ON public.payment_requests;
CREATE TRIGGER payment_requests_protect_fields
BEFORE UPDATE ON public.payment_requests
FOR EACH ROW EXECUTE FUNCTION public.protect_payment_request_fields();

REVOKE EXECUTE ON FUNCTION public.protect_card_order_fields() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_receipt_member_fields() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_payment_request_fields() FROM anon, authenticated;
