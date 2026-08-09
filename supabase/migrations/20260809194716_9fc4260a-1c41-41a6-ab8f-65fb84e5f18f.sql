ALTER TABLE public.business_cards
  ADD COLUMN IF NOT EXISTS commerce_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS payout_provider text,
  ADD COLUMN IF NOT EXISTS payout_url text,
  ADD COLUMN IF NOT EXISTS payout_display_name text;

CREATE TABLE public.card_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'product',
  title text NOT NULL,
  description text,
  image_url text,
  price numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  quantity integer,
  sold integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'live',
  is_quick_sell boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.card_listings TO authenticated;
GRANT SELECT ON public.card_listings TO anon;
GRANT ALL ON public.card_listings TO service_role;

ALTER TABLE public.card_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view live listings"
  ON public.card_listings FOR SELECT
  USING (status = 'live');

CREATE POLICY "Members manage their own listings"
  ON public.card_listings FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX card_listings_user_idx ON public.card_listings (user_id, status);

CREATE TABLE public.card_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.card_listings(id) ON DELETE SET NULL,
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_name text,
  buyer_email text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  platform_fee numeric(12,2) NOT NULL DEFAULT 0,
  processing_fee_estimate numeric(12,2) NOT NULL DEFAULT 0,
  net_to_seller numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending',
  payout_provider text,
  reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.card_orders TO authenticated;
GRANT ALL ON public.card_orders TO service_role;

ALTER TABLE public.card_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view their own card orders"
  ON public.card_orders FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own card orders"
  ON public.card_orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE INDEX card_orders_seller_idx ON public.card_orders (seller_id, created_at DESC);

CREATE TRIGGER update_card_listings_updated_at
  BEFORE UPDATE ON public.card_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_card_orders_updated_at
  BEFORE UPDATE ON public.card_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();