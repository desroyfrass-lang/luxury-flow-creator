CREATE TABLE public.payment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES public.card_listings(id) ON DELETE SET NULL,
  kind text NOT NULL DEFAULT 'sale',
  title text NOT NULL,
  note text,
  amount numeric NOT NULL CHECK (amount >= 0 AND amount <= 1000000),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 1 AND quantity <= 100000),
  currency text NOT NULL DEFAULT 'USD',
  buyer_name text,
  buyer_email text,
  buyer_phone text,
  delivery text NOT NULL DEFAULT 'qr',
  status text NOT NULL DEFAULT 'pending',
  order_id uuid REFERENCES public.card_orders(id) ON DELETE SET NULL,
  paid_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payment_requests_status_check CHECK (status IN ('pending','paid','declined','cancelled','expired')),
  CONSTRAINT payment_requests_kind_check CHECK (kind IN ('sale','service','ticket','booking','gift','tip','donation','partnership','other')),
  CONSTRAINT payment_requests_delivery_check CHECK (delivery IN ('qr','link','sms','email','push','message'))
);

CREATE INDEX payment_requests_seller_idx ON public.payment_requests (seller_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_requests TO authenticated;
GRANT ALL ON public.payment_requests TO service_role;

ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers manage their own payment requests"
ON public.payment_requests FOR ALL TO authenticated
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

CREATE TRIGGER update_payment_requests_updated_at
BEFORE UPDATE ON public.payment_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();