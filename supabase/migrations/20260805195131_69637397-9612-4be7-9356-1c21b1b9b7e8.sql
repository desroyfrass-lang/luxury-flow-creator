
CREATE TABLE public.builder_journeys (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress',
  current_stage TEXT NOT NULL DEFAULT 'mission',
  stage_progress JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.builder_journeys TO authenticated;
GRANT ALL ON public.builder_journeys TO service_role;
ALTER TABLE public.builder_journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Builders manage their own journey" ON public.builder_journeys
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER builder_journeys_updated_at BEFORE UPDATE ON public.builder_journeys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.builder_journey_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  stage TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX builder_journey_messages_user_created_idx
  ON public.builder_journey_messages (user_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.builder_journey_messages TO authenticated;
GRANT ALL ON public.builder_journey_messages TO service_role;
ALTER TABLE public.builder_journey_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Builders manage their own journey messages" ON public.builder_journey_messages
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.builder_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'onboarding',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, category, key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.builder_memory TO authenticated;
GRANT ALL ON public.builder_memory TO service_role;
ALTER TABLE public.builder_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Builders manage their own memory" ON public.builder_memory
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER builder_memory_updated_at BEFORE UPDATE ON public.builder_memory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
