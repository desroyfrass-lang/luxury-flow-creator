ALTER TABLE public.affiliate_policy
  ADD COLUMN marketplace_launched boolean NOT NULL DEFAULT false,
  ADD COLUMN approved_products_available boolean NOT NULL DEFAULT false,
  ADD COLUMN approved_brand_partners_available boolean NOT NULL DEFAULT false,
  ADD COLUMN internal_campaigns_ready boolean NOT NULL DEFAULT false,
  ADD COLUMN affiliate_marketing_activated boolean NOT NULL DEFAULT false;