-- STEP 5 · SLICE 3 — trusted payment verification for direct Frass Card sales.
-- A card order may only become "verified" from a signed provider event recorded
-- by trusted server code. No browser session (seller, buyer or admin) may write
-- the verification fields or set the verified status.

CREATE TABLE IF NOT EXISTS public.payment_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  event_id text NOT NULL,
  event_type text NOT NULL DEFAULT 'payment.succeeded',
  order_id uuid,
  payment_request_id uuid,
  seller_id uuid NOT NULL,
  amount numeric(14,2) NOT NULL,
  currency text NOT NULL,
  provider_payment_id text,
  signature_scheme text NOT NULL DEFAULT 'hmac-sha256',
  outcome text NOT NULL DEFAULT 'verified',
  reject_reason text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  received_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payment_confirmations_unique_event UNIQUE (provider, event_id),
  CONSTRAINT payment_confirmations_outcome_check CHECK (outcome IN ('verified','rejected'))
);

CREATE INDEX IF NOT EXISTS payment_confirmations_order_idx ON public.payment_confirmations (order_id);
CREATE INDEX IF NOT EXISTS payment_confirmations_seller_idx ON public.payment_confirmations (seller_id, received_at DESC);

GRANT SELECT ON public.payment_confirmations TO authenticated;
GRANT ALL ON public.payment_confirmations TO service_role;

ALTER TABLE public.payment_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers read their own payment confirmations"
  ON public.payment_confirmations FOR SELECT TO authenticated
  USING (auth.uid() = seller_id);

-- Server-controlled verification fields on the order itself.
ALTER TABLE public.card_orders
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_confirmation_id uuid REFERENCES public.payment_confirmations(id);

-- The Builder's protected 3% entry records which confirmation justified it.
ALTER TABLE public.builder_protected_fund_entries
  ADD COLUMN IF NOT EXISTS confirmation_id uuid REFERENCES public.payment_confirmations(id);

-- No signed-in session may forge verification, not even an admin.
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