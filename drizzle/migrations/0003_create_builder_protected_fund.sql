CREATE TABLE public.builder_protected_fund_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  vault_id uuid,
  source_kind text NOT NULL,
  source_ref text NOT NULL,
  transaction_type text NOT NULL DEFAULT 'direct-card-sale',
  gross numeric(14,2) NOT NULL DEFAULT 0,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  rate_pct numeric(5,2) NOT NULL DEFAULT 3.00,
  currency text NOT NULL DEFAULT 'USD',
  state text NOT NULL DEFAULT 'expected',
  verified_at timestamptz,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT builder_protected_fund_source_kind_chk CHECK (source_kind IN ('card-order','card-payment')),
  CONSTRAINT builder_protected_fund_state_chk CHECK (state IN ('expected','posted')),
  CONSTRAINT builder_protected_fund_verified_chk CHECK (
    (state = 'expected' AND verified_at IS NULL) OR (state = 'posted' AND verified_at IS NOT NULL)
  ),
  CONSTRAINT builder_protected_fund_amount_chk CHECK (amount >= 0 AND gross >= 0),
  CONSTRAINT builder_protected_fund_unique_source UNIQUE (owner_id, source_kind, source_ref)
);

CREATE INDEX builder_protected_fund_owner_idx
  ON public.builder_protected_fund_entries (owner_id, state, created_at DESC);

GRANT SELECT ON public.builder_protected_fund_entries TO authenticated;
GRANT ALL ON public.builder_protected_fund_entries TO service_role;

ALTER TABLE public.builder_protected_fund_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Builders read their own protected fund"
  ON public.builder_protected_fund_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE TRIGGER builder_protected_fund_set_updated_at
  BEFORE UPDATE ON public.builder_protected_fund_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();