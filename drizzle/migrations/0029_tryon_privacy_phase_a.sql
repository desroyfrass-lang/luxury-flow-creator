-- Phase A: customer try-on photos and results are owner-only. No admin browsing.
DROP POLICY IF EXISTS "Admins view all photos" ON public.customer_photos;
DROP POLICY IF EXISTS "Admins view all looks" ON public.tryon_looks;
COMMENT ON TABLE public.customer_photos IS 'Private customer try-on source photos. Owner-only (RLS). No admin read path until a consent-gated flow is approved.';
COMMENT ON TABLE public.tryon_looks IS 'Private try-on results. Owner-only (RLS). No admin read path until a consent-gated flow is approved.';