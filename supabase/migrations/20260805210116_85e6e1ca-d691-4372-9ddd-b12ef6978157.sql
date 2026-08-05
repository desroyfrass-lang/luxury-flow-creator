CREATE TABLE public.builder_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.builder_collections TO authenticated;
GRANT ALL ON public.builder_collections TO service_role;
ALTER TABLE public.builder_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Builders manage their own collections" ON public.builder_collections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.builder_drops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  drop_date DATE,
  status TEXT NOT NULL DEFAULT 'planned',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.builder_drops TO authenticated;
GRANT ALL ON public.builder_drops TO service_role;
ALTER TABLE public.builder_drops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Builders manage their own drops" ON public.builder_drops FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.builder_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2),
  currency TEXT NOT NULL DEFAULT 'USD',
  image_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  collection_id UUID REFERENCES public.builder_collections(id) ON DELETE SET NULL,
  drop_id UUID REFERENCES public.builder_drops(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.builder_products TO authenticated;
GRANT ALL ON public.builder_products TO service_role;
ALTER TABLE public.builder_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Builders manage their own products" ON public.builder_products FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_builder_products_user ON public.builder_products(user_id, created_at DESC);
CREATE INDEX idx_builder_collections_user ON public.builder_collections(user_id, created_at DESC);
CREATE INDEX idx_builder_drops_user ON public.builder_drops(user_id, created_at DESC);

CREATE TRIGGER builder_collections_updated_at BEFORE UPDATE ON public.builder_collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER builder_drops_updated_at BEFORE UPDATE ON public.builder_drops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER builder_products_updated_at BEFORE UPDATE ON public.builder_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();