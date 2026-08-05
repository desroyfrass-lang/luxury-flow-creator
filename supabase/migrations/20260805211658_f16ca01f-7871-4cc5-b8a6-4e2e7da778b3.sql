CREATE TABLE public.builder_learning_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'lesson',
  path_id text,
  lesson_id text,
  title text NOT NULL,
  detail text,
  skills text[] NOT NULL DEFAULT '{}',
  artifact_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.builder_learning_events TO authenticated;
GRANT ALL ON public.builder_learning_events TO service_role;

ALTER TABLE public.builder_learning_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Builders manage their own learning timeline"
ON public.builder_learning_events FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX builder_learning_events_user_created_idx
  ON public.builder_learning_events (user_id, created_at DESC);

ALTER TABLE public.builder_path_progress
  ADD COLUMN IF NOT EXISTS is_primary boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lesson_notes jsonb NOT NULL DEFAULT '{}'::jsonb;