-- 1) Roles
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 2) Single-image slots
CREATE TABLE public.site_images (
  slot_key text PRIMARY KEY,
  url text NOT NULL,
  alt text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_images TO authenticated;
GRANT ALL ON public.site_images TO service_role;

ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site_images"
  ON public.site_images FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert site_images"
  ON public.site_images FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site_images"
  ON public.site_images FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site_images"
  ON public.site_images FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3) Lookbook story galleries
CREATE TABLE public.lookbook_story_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_slug text NOT NULL,
  position int NOT NULL DEFAULT 0,
  url text NOT NULL,
  alt text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX lookbook_story_images_slug_pos_idx
  ON public.lookbook_story_images (story_slug, position);

GRANT SELECT ON public.lookbook_story_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.lookbook_story_images TO authenticated;
GRANT ALL ON public.lookbook_story_images TO service_role;

ALTER TABLE public.lookbook_story_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read lookbook_story_images"
  ON public.lookbook_story_images FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins manage lookbook_story_images"
  ON public.lookbook_story_images FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4) Per-product image overrides
CREATE TABLE public.product_image_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  position int NOT NULL DEFAULT 0,
  url text NOT NULL,
  alt text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX product_image_overrides_product_pos_idx
  ON public.product_image_overrides (product_id, position);

GRANT SELECT ON public.product_image_overrides TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_image_overrides TO authenticated;
GRANT ALL ON public.product_image_overrides TO service_role;

ALTER TABLE public.product_image_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read product_image_overrides"
  ON public.product_image_overrides FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins manage product_image_overrides"
  ON public.product_image_overrides FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5) Storage RLS for the site-images bucket
CREATE POLICY "Public can read site-images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'site-images');

CREATE POLICY "Admins can upload to site-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));