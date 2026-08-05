CREATE TABLE public.builder_path_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  path_id text NOT NULL,
  completed_lessons text[] NOT NULL DEFAULT '{}',
  reflection text,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, path_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.builder_path_progress TO authenticated;
GRANT ALL ON public.builder_path_progress TO service_role;
ALTER TABLE public.builder_path_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Builders manage their own path progress"
  ON public.builder_path_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_builder_path_progress_updated_at
  BEFORE UPDATE ON public.builder_path_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();