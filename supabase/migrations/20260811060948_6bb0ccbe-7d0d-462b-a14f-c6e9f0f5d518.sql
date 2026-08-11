-- 1. Official gift price list (server-owned truth)
CREATE TABLE IF NOT EXISTS public.live_gift_catalog (
  gift_key text PRIMARY KEY,
  label text NOT NULL,
  credits integer NOT NULL CHECK (credits > 0),
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.live_gift_catalog TO anon, authenticated;
GRANT ALL ON public.live_gift_catalog TO service_role;

ALTER TABLE public.live_gift_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Gift price list is public" ON public.live_gift_catalog;
CREATE POLICY "Gift price list is public"
  ON public.live_gift_catalog FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins curate the gift price list" ON public.live_gift_catalog;
CREATE POLICY "Admins curate the gift price list"
  ON public.live_gift_catalog FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.live_gift_catalog (gift_key, label, credits, amount) VALUES
  ('clap', 'Clap', 100, 0.10),
  ('palm', 'Palm', 500, 0.50),
  ('gold_star', 'Gold Star', 2000, 2.00),
  ('crown', 'Frass Crown', 10000, 10.00)
ON CONFLICT (gift_key) DO NOTHING;

-- 2. Gift integrity: canonical pricing + atomic wallet debit
CREATE OR REPLACE FUNCTION public.enforce_live_gift_integrity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _gift public.live_gift_catalog%ROWTYPE;
  _balance integer;
BEGIN
  -- A gift can only ever be sent as yourself.
  IF _uid IS NOT NULL AND NEW.sender_id IS DISTINCT FROM _uid THEN
    RAISE EXCEPTION 'A gift can only be sent as yourself.';
  END IF;

  SELECT * INTO _gift
  FROM public.live_gift_catalog
  WHERE gift_key = NEW.gift_key AND active;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unknown gift.';
  END IF;

  -- The price list is the only source of truth; client values are discarded.
  NEW.credits := _gift.credits;
  NEW.amount := _gift.amount;
  NEW.currency := 'USD';

  -- Atomically debit the sender's wallet; refuses when the balance is short.
  UPDATE public.ai_credit_wallets w
     SET balance = w.balance - _gift.credits,
         lifetime_gifted = w.lifetime_gifted + _gift.credits,
         updated_at = now()
   WHERE w.user_id = NEW.sender_id
     AND w.balance >= _gift.credits
  RETURNING w.balance INTO _balance;

  IF _balance IS NULL THEN
    RAISE EXCEPTION 'Not enough credits to send this gift.';
  END IF;

  INSERT INTO public.ai_credit_ledger (user_id, direction, amount, label, description, metadata)
  VALUES (
    NEW.sender_id,
    'debit',
    _gift.credits,
    'Live gift: ' || _gift.label,
    'Sent during a live broadcast',
    jsonb_build_object('broadcast_id', NEW.broadcast_id, 'gift_key', _gift.gift_key)
  );

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enforce_live_gift_integrity() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enforce_live_gift_integrity ON public.live_gifts;
CREATE TRIGGER enforce_live_gift_integrity
  BEFORE INSERT ON public.live_gifts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_live_gift_integrity();

-- Gifts are immutable financial records.
DROP POLICY IF EXISTS "Members send gifts as themselves" ON public.live_gifts;
CREATE POLICY "Members send gifts as themselves"
  ON public.live_gifts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id AND credits > 0);

-- 3. Internal allocation math is no longer callable by signed-in members
REVOKE EXECUTE ON FUNCTION public.expected_platform_allocation(numeric) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expected_platform_allocation(numeric) TO service_role;