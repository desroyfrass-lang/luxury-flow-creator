
CREATE TABLE public.frassy_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  pinned BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.frassy_notes TO authenticated;
GRANT ALL ON public.frassy_notes TO service_role;

ALTER TABLE public.frassy_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage their own notes"
  ON public.frassy_notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX frassy_notes_user_active_idx
  ON public.frassy_notes (user_id, pinned DESC, created_at DESC)
  WHERE archived_at IS NULL;

CREATE TRIGGER update_frassy_notes_updated_at
  BEFORE UPDATE ON public.frassy_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
