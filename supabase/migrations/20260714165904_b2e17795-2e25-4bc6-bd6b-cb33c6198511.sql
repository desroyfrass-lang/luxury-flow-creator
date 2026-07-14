CREATE TABLE public.viral_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_slug text NOT NULL,
  sub_slug text NOT NULL,
  slug text NOT NULL,
  title text NOT NULL,
  blurb text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  compare_at numeric(10,2),
  rating numeric(3,2) NOT NULL DEFAULT 4.8,
  reviews integer NOT NULL DEFAULT 0,
  sold text NOT NULL DEFAULT '',
  badge text,
  image text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category_slug, sub_slug, slug)
);

GRANT SELECT ON public.viral_products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.viral_products TO authenticated;
GRANT ALL ON public.viral_products TO service_role;

ALTER TABLE public.viral_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Viral products are viewable by everyone"
  ON public.viral_products FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert viral products"
  ON public.viral_products FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update viral products"
  ON public.viral_products FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete viral products"
  ON public.viral_products FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX viral_products_cat_sub_idx ON public.viral_products (category_slug, sub_slug, sort_order);

CREATE TRIGGER viral_products_set_updated_at
  BEFORE UPDATE ON public.viral_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();