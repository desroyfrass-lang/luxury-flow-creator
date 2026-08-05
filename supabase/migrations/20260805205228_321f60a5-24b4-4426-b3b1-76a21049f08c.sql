CREATE TABLE public.vault_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'note',
  body text,
  url text,
  collection text,
  tags text[] NOT NULL DEFAULT '{}',
  pinned boolean NOT NULL DEFAULT false,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vault_items TO authenticated;
GRANT ALL ON public.vault_items TO service_role;

ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Builders manage their own vault items"
ON public.vault_items FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE INDEX vault_items_user_idx ON public.vault_items (user_id, created_at DESC);

CREATE TRIGGER update_vault_items_updated_at
BEFORE UPDATE ON public.vault_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();