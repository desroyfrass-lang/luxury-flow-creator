CREATE TABLE public.allocation_ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  confirmation_id uuid NOT NULL REFERENCES public.payment_confirmations(id) ON DELETE RESTRICT,
  order_id uuid,
  source_kind text NOT NULL DEFAULT 'card-order',
  source_ref text NOT NULL,
  transaction_type text NOT NULL DEFAULT 'direct-card-sale',
  share text NOT NULL,
  beneficiary_kind text NOT NULL,
  beneficiary_id uuid,
  gross numeric(14,2) NOT NULL DEFAULT 0,
  rate_pct numeric(5,2) NOT NULL DEFAULT 0,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  currency text NOT NULL,
  state text NOT NULL DEFAULT 'recorded',
  verified_at timestamptz NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT allocation_ledger_share_chk CHECK (share IN ('earner','infrastructure','reserve','foundation','founder','cofounder')),
  CONSTRAINT allocation_ledger_state_chk CHECK (state = 'recorded'),
  CONSTRAINT allocation_ledger_amount_chk CHECK (amount >= 0 AND gross >= 0),
  CONSTRAINT allocation_ledger_currency_chk CHECK (currency = upper(currency) AND char_length(currency) = 3),
  CONSTRAINT allocation_ledger_unique_share UNIQUE (confirmation_id, share)
);

CREATE INDEX allocation_ledger_beneficiary_idx
  ON public.allocation_ledger_entries (beneficiary_id, created_at DESC);
CREATE INDEX allocation_ledger_order_idx
  ON public.allocation_ledger_entries (order_id);

GRANT SELECT ON public.allocation_ledger_entries TO authenticated;
GRANT ALL ON public.allocation_ledger_entries TO service_role;

ALTER TABLE public.allocation_ledger_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Beneficiaries read their own allocation entries"
  ON public.allocation_ledger_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = beneficiary_id);

CREATE POLICY "Admins read all allocation entries"
  ON public.allocation_ledger_entries
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));