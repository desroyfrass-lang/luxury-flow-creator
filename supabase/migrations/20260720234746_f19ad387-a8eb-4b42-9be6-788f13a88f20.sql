
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- Catalog embeddings (Shopify + Viral products)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.product_visual_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_type TEXT NOT NULL CHECK (source_type IN ('shopify','viral')),
  source_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  handle TEXT,
  category_slug TEXT,
  sub_slug TEXT,
  price NUMERIC(10,2),
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(3072) NOT NULL,
  model_version TEXT NOT NULL DEFAULT 'google/gemini-embedding-2',
  indexed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_type, source_id)
);

GRANT SELECT ON public.product_visual_embeddings TO authenticated, anon;
GRANT ALL ON public.product_visual_embeddings TO service_role;

ALTER TABLE public.product_visual_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read product visual embeddings"
  ON public.product_visual_embeddings FOR SELECT
  USING (true);

CREATE POLICY "Admins manage product visual embeddings"
  ON public.product_visual_embeddings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS product_visual_embeddings_source_idx
  ON public.product_visual_embeddings (source_type, category_slug, sub_slug);

CREATE INDEX IF NOT EXISTS product_visual_embeddings_vec_idx
  ON public.product_visual_embeddings
  USING hnsw ((embedding::halfvec(3072)) halfvec_cosine_ops);

-- ============================================================
-- Customer visual uploads (temp by default, 24h auto-purge)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.visual_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding vector(3072),
  is_saved BOOLEAN NOT NULL DEFAULT false,
  board_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.visual_uploads TO authenticated;
GRANT ALL ON public.visual_uploads TO service_role;

ALTER TABLE public.visual_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own uploads"
  ON public.visual_uploads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert their own uploads"
  ON public.visual_uploads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploads"
  ON public.visual_uploads FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploads"
  ON public.visual_uploads FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS visual_uploads_user_idx
  ON public.visual_uploads (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS visual_uploads_expires_idx
  ON public.visual_uploads (expires_at)
  WHERE is_saved = false;

-- ============================================================
-- Storage policies for visual-uploads bucket (per-user folder)
-- Convention: {user_id}/{uuid}.{ext}
-- ============================================================
CREATE POLICY "Users upload to their own visual folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'visual-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users read their own visual uploads"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'visual-uploads'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.has_role(auth.uid(), 'admin'::app_role)
    )
  );

CREATE POLICY "Users delete their own visual uploads"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'visual-uploads'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.has_role(auth.uid(), 'admin'::app_role)
    )
  );

-- ============================================================
-- Similarity search RPC
-- ============================================================
CREATE OR REPLACE FUNCTION public.match_product_visuals(
  query_embedding vector(3072),
  match_count INT DEFAULT 12,
  source_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  source_type TEXT,
  source_id TEXT,
  title TEXT,
  image_url TEXT,
  handle TEXT,
  category_slug TEXT,
  sub_slug TEXT,
  price NUMERIC,
  attributes JSONB,
  similarity FLOAT
)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT
    e.id, e.source_type, e.source_id, e.title, e.image_url, e.handle,
    e.category_slug, e.sub_slug, e.price, e.attributes,
    1 - (e.embedding::halfvec(3072) <=> query_embedding::halfvec(3072)) AS similarity
  FROM public.product_visual_embeddings e
  WHERE source_filter IS NULL OR e.source_type = source_filter
  ORDER BY e.embedding::halfvec(3072) <=> query_embedding::halfvec(3072)
  LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION public.match_product_visuals(vector, INT, TEXT) TO authenticated, anon;

-- ============================================================
-- 24h purge helper (called from an admin server fn / cron)
-- ============================================================
CREATE OR REPLACE FUNCTION public.purge_expired_visual_uploads()
RETURNS INT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INT;
BEGIN
  WITH deleted AS (
    DELETE FROM public.visual_uploads
    WHERE is_saved = false AND expires_at < now()
    RETURNING 1
  )
  SELECT count(*) INTO deleted_count FROM deleted;
  RETURN deleted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_expired_visual_uploads() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purge_expired_visual_uploads() TO service_role;
