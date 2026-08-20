CREATE TABLE public.founder_audit_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  card_key TEXT NOT NULL,
  card_number INTEGER NOT NULL DEFAULT 0,
  card_title TEXT NOT NULL DEFAULT '',
  card_path TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX founder_audit_ledger_user_created_idx ON public.founder_audit_ledger (user_id, created_at);

GRANT SELECT, INSERT, DELETE ON public.founder_audit_ledger TO authenticated;
GRANT ALL ON public.founder_audit_ledger TO service_role;

ALTER TABLE public.founder_audit_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders read their own audit ledger"
  ON public.founder_audit_ledger FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Founders append to their own audit ledger"
  ON public.founder_audit_ledger FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Founders delete their own audit ledger entries"
  ON public.founder_audit_ledger FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));