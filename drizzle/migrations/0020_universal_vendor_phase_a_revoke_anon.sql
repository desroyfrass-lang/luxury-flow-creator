REVOKE ALL ON public.vendor_profiles, public.canonical_products, public.vendor_offers, public.product_sources FROM anon, PUBLIC;
REVOKE DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.vendor_profiles, public.canonical_products, public.product_sources FROM authenticated;
REVOKE UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.product_sources FROM authenticated;