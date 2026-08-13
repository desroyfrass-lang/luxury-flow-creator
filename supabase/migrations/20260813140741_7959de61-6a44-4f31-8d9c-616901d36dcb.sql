REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.collection_products FROM anon;
GRANT SELECT ON public.collection_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collection_products TO authenticated;
GRANT ALL ON public.collection_products TO service_role;