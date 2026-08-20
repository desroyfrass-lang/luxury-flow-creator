REVOKE SELECT ON public.verified_feedback FROM anon;
GRANT SELECT (id, source, source_id, experience, body, is_published, created_at, updated_at) ON public.verified_feedback TO anon;