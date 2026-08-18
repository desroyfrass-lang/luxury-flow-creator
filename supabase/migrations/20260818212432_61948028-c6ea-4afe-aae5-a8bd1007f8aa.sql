CREATE TABLE public.teleporter_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_key text NOT NULL,
  card_number integer NOT NULL,
  status text NOT NULL DEFAULT 'not_reviewed' CHECK (status IN ('not_reviewed','in_progress','reviewed','consolidated','retired')),
  note text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, card_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.teleporter_audit TO authenticated;
GRANT ALL ON public.teleporter_audit TO service_role;

ALTER TABLE public.teleporter_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders manage their own teleporter audit"
ON public.teleporter_audit
FOR ALL
TO authenticated
USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER teleporter_audit_updated_at
BEFORE UPDATE ON public.teleporter_audit
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();