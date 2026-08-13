CREATE TABLE public.founder_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.founding_partners(id) ON DELETE CASCADE,
  founder_note text NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.founder_notes TO service_role;

ALTER TABLE public.founder_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON public.founder_notes
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER founder_notes_updated_at
  BEFORE UPDATE ON public.founder_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX founder_notes_partner_idx ON public.founder_notes(partner_id);

INSERT INTO public.founder_notes (partner_id, founder_note, created_by, created_at)
SELECT id, note, invited_by, invited_at
FROM public.founding_partners
WHERE note IS NOT NULL AND btrim(note) <> '';

ALTER TABLE public.founding_partners DROP COLUMN note;

REVOKE SELECT (user_id) ON public.founding_partners FROM anon;
