CREATE TABLE public.voice_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'general',
  source text NOT NULL DEFAULT 'daily',
  status text NOT NULL DEFAULT 'new',
  audio_path text,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  duration_seconds numeric,
  transcript text,
  summary text,
  themes text[] NOT NULL DEFAULT '{}',
  sentiment text,
  founder_note text,
  implemented_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.voice_feedback TO authenticated;
GRANT ALL ON public.voice_feedback TO service_role;
ALTER TABLE public.voice_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members submit their own voice feedback"
  ON public.voice_feedback FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members read their own voice feedback"
  ON public.voice_feedback FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins manage voice feedback"
  ON public.voice_feedback FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins delete voice feedback"
  ON public.voice_feedback FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER update_voice_feedback_updated_at
  BEFORE UPDATE ON public.voice_feedback
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX voice_feedback_created_idx ON public.voice_feedback (created_at DESC);
CREATE INDEX voice_feedback_user_idx ON public.voice_feedback (user_id);

CREATE TABLE public.launch_program_settings (
  id text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT true,
  notice text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.launch_program_settings TO authenticated;
GRANT SELECT ON public.launch_program_settings TO anon;
GRANT ALL ON public.launch_program_settings TO service_role;
ALTER TABLE public.launch_program_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read launch program settings"
  ON public.launch_program_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins update launch program settings"
  ON public.launch_program_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

GRANT INSERT, UPDATE, DELETE ON public.launch_program_settings TO authenticated;

INSERT INTO public.launch_program_settings (id, enabled, notice)
VALUES ('voice_feedback', true, 'Temporary launch program — your voice helps shape Frass.');
