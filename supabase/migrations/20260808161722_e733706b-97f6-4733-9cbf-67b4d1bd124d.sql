
CREATE TYPE public.activity_status AS ENUM ('draft','founder_review','approved','published','archived','retired');

CREATE TABLE public.learning_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  district text NOT NULL DEFAULT 'kids_world',
  age_group text NOT NULL,
  place_slug text,
  category text,
  difficulty text NOT NULL DEFAULT 'gentle',
  duration_minutes integer NOT NULL DEFAULT 10,
  learning_objective text,
  description text,
  hero_image text,
  thumbnail text,
  video_url text,
  audio_url text,
  story text,
  instructions jsonb NOT NULL DEFAULT '[]'::jsonb,
  materials jsonb NOT NULL DEFAULT '[]'::jsonb,
  parent_guide text,
  teacher_guide text,
  discussion_questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  reflection_questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  worksheets jsonb NOT NULL DEFAULT '[]'::jsonb,
  coloring_pages jsonb NOT NULL DEFAULT '[]'::jsonb,
  downloads jsonb NOT NULL DEFAULT '[]'::jsonb,
  slides jsonb NOT NULL DEFAULT '[]'::jsonb,
  quiz jsonb NOT NULL DEFAULT '[]'::jsonb,
  badge jsonb NOT NULL DEFAULT '{}'::jsonb,
  skills text[] NOT NULL DEFAULT '{}',
  follow_up_slugs text[] NOT NULL DEFAULT '{}',
  related_slugs text[] NOT NULL DEFAULT '{}',
  seasonal_tags text[] NOT NULL DEFAULT '{}',
  themes text[] NOT NULL DEFAULT '{}',
  extras jsonb NOT NULL DEFAULT '{}'::jsonb,
  status public.activity_status NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  position integer NOT NULL DEFAULT 0,
  featured boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_learning_activities_lookup ON public.learning_activities (district, age_group, place_slug, status);

GRANT SELECT ON public.learning_activities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_activities TO authenticated;
GRANT ALL ON public.learning_activities TO service_role;

ALTER TABLE public.learning_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published activities are public" ON public.learning_activities
FOR SELECT TO anon, authenticated USING (status = 'published');

CREATE POLICY "Staff can read all activities" ON public.learning_activities
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'staff'));

CREATE POLICY "Staff can insert activities" ON public.learning_activities
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'staff'));

CREATE POLICY "Staff can update activities" ON public.learning_activities
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'staff'))
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'staff'));

CREATE POLICY "Admins can delete activities" ON public.learning_activities
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER update_learning_activities_updated_at
BEFORE UPDATE ON public.learning_activities
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.learning_activity_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES public.learning_activities(id) ON DELETE CASCADE,
  version integer NOT NULL,
  snapshot jsonb NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.learning_activity_versions TO authenticated;
GRANT ALL ON public.learning_activity_versions TO service_role;

ALTER TABLE public.learning_activity_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read versions" ON public.learning_activity_versions
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'staff'));

CREATE POLICY "Staff can write versions" ON public.learning_activity_versions
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'staff'));

CREATE OR REPLACE FUNCTION public.snapshot_learning_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    NEW.version := OLD.version + 1;
    IF NEW.status = 'published' AND OLD.status <> 'published' THEN
      NEW.published_at := now();
    END IF;
    INSERT INTO public.learning_activity_versions (activity_id, version, snapshot, changed_by)
    VALUES (OLD.id, OLD.version, to_jsonb(OLD), auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER snapshot_learning_activity_before_update
BEFORE UPDATE ON public.learning_activities
FOR EACH ROW EXECUTE FUNCTION public.snapshot_learning_activity();
