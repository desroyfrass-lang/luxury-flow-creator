CREATE TABLE public.future_business_vaults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key text NOT NULL,
  emoji text NOT NULL DEFAULT '💡',
  label text NOT NULL,
  summary text,
  rationale text,
  status text NOT NULL DEFAULT 'future' CHECK (status IN ('future','activated')),
  notes text,
  activated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.future_business_vaults TO authenticated;
GRANT ALL ON public.future_business_vaults TO service_role;

ALTER TABLE public.future_business_vaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners manage their own future vaults"
  ON public.future_business_vaults FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Founders can view all future vaults"
  ON public.future_business_vaults FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER future_business_vaults_updated_at
  BEFORE UPDATE ON public.future_business_vaults
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();