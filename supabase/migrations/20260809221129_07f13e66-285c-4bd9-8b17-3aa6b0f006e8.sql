-- FRASS-0439 Customer Confidence & Payment Recovery

ALTER TABLE public.payment_requests
  ADD COLUMN IF NOT EXISTS idempotency_key text,
  ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS first_viewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS processing_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS declined_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz,
  ADD COLUMN IF NOT EXISTS expired_at timestamptz,
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz,
  ADD COLUMN IF NOT EXISTS failure_reason text;

-- One vocabulary, one outcome.
UPDATE public.payment_requests SET status = 'awaiting_approval' WHERE status = 'pending';
UPDATE public.payment_requests SET status = 'successful' WHERE status IN ('paid', 'complete', 'completed');

ALTER TABLE public.payment_requests ALTER COLUMN status SET DEFAULT 'awaiting_approval';

ALTER TABLE public.payment_requests DROP CONSTRAINT IF EXISTS payment_requests_status_check;
ALTER TABLE public.payment_requests
  ADD CONSTRAINT payment_requests_status_check CHECK (status IN (
    'preparing','awaiting_approval','processing','successful','declined','cancelled','expired','refunded'
  ));

-- Default expiry window: 30 minutes.
ALTER TABLE public.payment_requests
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '30 minutes');

-- Duplicate protection: a seller reference can only create one request.
CREATE UNIQUE INDEX IF NOT EXISTS payment_requests_seller_idempotency_key
  ON public.payment_requests (seller_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS payment_requests_status_created_idx
  ON public.payment_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS payment_requests_seller_created_idx
  ON public.payment_requests (seller_id, created_at DESC);

-- Automatic expiry sweep.
CREATE OR REPLACE FUNCTION public.expire_stale_payment_requests()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE affected integer;
BEGIN
  UPDATE public.payment_requests
     SET status = 'expired', expired_at = now()
   WHERE status IN ('preparing','awaiting_approval')
     AND expires_at IS NOT NULL
     AND expires_at < now();
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

REVOKE ALL ON FUNCTION public.expire_stale_payment_requests() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expire_stale_payment_requests() TO service_role;

CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  PERFORM cron.unschedule('expire-stale-payment-requests');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'expire-stale-payment-requests',
  '*/5 * * * *',
  $$SELECT public.expire_stale_payment_requests();$$
);