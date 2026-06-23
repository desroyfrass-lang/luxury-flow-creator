CREATE TABLE public.site_text (
  slot_key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_text TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_text TO authenticated;
GRANT ALL ON public.site_text TO service_role;

ALTER TABLE public.site_text ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site_text"
  ON public.site_text FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert site_text"
  ON public.site_text FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site_text"
  ON public.site_text FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site_text"
  ON public.site_text FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));