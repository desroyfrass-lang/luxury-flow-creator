REVOKE ALL ON public.tryon_readiness FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.tryon_readiness FROM authenticated;
GRANT SELECT ON public.tryon_readiness TO authenticated;