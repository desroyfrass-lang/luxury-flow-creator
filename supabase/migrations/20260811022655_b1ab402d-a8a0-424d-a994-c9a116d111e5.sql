ALTER TABLE public.card_listings
  ADD COLUMN IF NOT EXISTS brand text,
  ADD COLUMN IF NOT EXISTS collection text,
  ADD COLUMN IF NOT EXISTS gallery text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS details jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS card_listings_collection_idx ON public.card_listings (user_id, collection);