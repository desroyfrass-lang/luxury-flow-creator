CREATE TABLE public.for_us_stories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id text NOT NULL DEFAULT 'today',
  series text,
  source_label text NOT NULL DEFAULT 'Frass Hill',
  title text NOT NULL,
  summary text NOT NULL,
  body text,
  categories text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  media_url text,
  media_kind text NOT NULL DEFAULT 'none',
  cta_label text,
  cta_to text,
  impact_note text,
  revenue_note text,
  audience text NOT NULL DEFAULT 'everyone',
  status text NOT NULL DEFAULT 'proposed',
  origin text NOT NULL DEFAULT 'frassy',
  occurred_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  proposed_by uuid REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT for_us_stories_status_chk CHECK (status IN ('proposed','draft','approved','published','archived')),
  CONSTRAINT for_us_stories_origin_chk CHECK (origin IN ('frassy','founder','community')),
  CONSTRAINT for_us_stories_media_chk CHECK (media_kind IN ('none','image','video','audio')),
  CONSTRAINT for_us_stories_audience_chk CHECK (audience IN ('everyone','members','founder'))
);

GRANT SELECT ON public.for_us_stories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.for_us_stories TO authenticated;
GRANT ALL ON public.for_us_stories TO service_role;

ALTER TABLE public.for_us_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published community stories are public"
  ON public.for_us_stories FOR SELECT
  USING (status = 'published' AND audience = 'everyone');

CREATE POLICY "Members read published member stories"
  ON public.for_us_stories FOR SELECT TO authenticated
  USING (status = 'published' AND audience IN ('everyone','members'));

CREATE POLICY "Admins read every community story"
  ON public.for_us_stories FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins create community stories"
  ON public.for_us_stories FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins edit community stories"
  ON public.for_us_stories FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins delete community stories"
  ON public.for_us_stories FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE INDEX for_us_stories_status_idx ON public.for_us_stories (status, published_at DESC);

CREATE TRIGGER update_for_us_stories_updated_at
  BEFORE UPDATE ON public.for_us_stories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();