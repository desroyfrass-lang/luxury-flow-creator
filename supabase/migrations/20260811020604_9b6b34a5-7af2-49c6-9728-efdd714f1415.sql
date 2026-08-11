CREATE TABLE public.partner_journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  prompt TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  mood TEXT,
  shared BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, entry_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_journal_entries TO authenticated;
GRANT ALL ON public.partner_journal_entries TO service_role;

ALTER TABLE public.partner_journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners manage their own journal"
  ON public.partner_journal_entries FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Founders read shared entries only"
  ON public.partner_journal_entries FOR SELECT TO authenticated
  USING (
    shared = true
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  );

CREATE TRIGGER partner_journal_entries_updated_at
  BEFORE UPDATE ON public.partner_journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();