CREATE TABLE public.teleporter_audit_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  audit_session text NOT NULL UNIQUE,
  card_number integer NOT NULL,
  card_key text NOT NULL,
  canonical_route text NOT NULL,
  card_title text NOT NULL,
  registry_version text NOT NULL,
  registry_hash text NOT NULL,
  locked boolean NOT NULL DEFAULT true,
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);

GRANT SELECT, INSERT, UPDATE ON public.teleporter_audit_sessions TO authenticated;
GRANT ALL ON public.teleporter_audit_sessions TO service_role;

ALTER TABLE public.teleporter_audit_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage their own teleporter audit sessions"
ON public.teleporter_audit_sessions
FOR ALL
TO authenticated
USING (founder_id = auth.uid() AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (founder_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

CREATE INDEX teleporter_audit_sessions_open_idx
  ON public.teleporter_audit_sessions (founder_id, closed_at, opened_at DESC);