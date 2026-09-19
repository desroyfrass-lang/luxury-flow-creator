-- STEP 5 · SLICE 5 — remember the one Stripe TEST checkout page opened for an
-- order, so the same order cannot spawn a pile of payable links.
-- These fields are written by trusted server code only. No signed-in session
-- (seller, buyer or admin) may set or change them.

ALTER TABLE public.card_orders
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_session_url text,
  ADD COLUMN IF NOT EXISTS stripe_session_expires_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS card_orders_stripe_session_idx
  ON public.card_orders (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.protect_card_order_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    NEW.verified_at := OLD.verified_at;
    NEW.payment_confirmation_id := OLD.payment_confirmation_id;
    NEW.stripe_session_id := OLD.stripe_session_id;
    NEW.stripe_session_url := OLD.stripe_session_url;
    NEW.stripe_session_expires_at := OLD.stripe_session_expires_at;
    IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status = 'verified' THEN
      RAISE EXCEPTION 'Only the payment system can verify an order.';
    END IF;
  END IF;

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
$function$;