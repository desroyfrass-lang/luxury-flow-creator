-- FRASS-0433 Financial Integrity & Audit Constitution

CREATE TABLE public.financial_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  direction text NOT NULL DEFAULT 'in' CHECK (direction IN ('in','out')),
  kind text NOT NULL,
  source text NOT NULL DEFAULT 'frass',
  title text NOT NULL,
  description text,
  counterparty_name text,
  counterparty_id uuid,
  gross numeric(14,2) NOT NULL DEFAULT 0,
  platform_allocation numeric(14,2) NOT NULL DEFAULT 0,
  processing_fee numeric(14,2) NOT NULL DEFAULT 0,
  other_deductions numeric(14,2) NOT NULL DEFAULT 0,
  net numeric(14,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','settled','refunded','withdrawn','cancelled')),
  reference text,
  external_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  settled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX financial_receipts_user_time_idx ON public.financial_receipts (user_id, occurred_at DESC);
CREATE INDEX financial_receipts_kind_idx ON public.financial_receipts (user_id, kind);

GRANT SELECT, INSERT, UPDATE ON public.financial_receipts TO authenticated;
GRANT ALL ON public.financial_receipts TO service_role;

ALTER TABLE public.financial_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read their own receipts"
  ON public.financial_receipts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all receipts"
  ON public.financial_receipts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Members record their own receipts"
  ON public.financial_receipts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members update their own open receipts"
  ON public.financial_receipts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Immutable audit trail: a settled record can never be rewritten or deleted.
CREATE OR REPLACE FUNCTION public.protect_settled_receipts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Financial receipts are permanent. Record an adjustment instead of deleting.';
  END IF;

  IF OLD.status IN ('settled','refunded','withdrawn') THEN
    RAISE EXCEPTION 'Receipt % has settled and is immutable. Record a financial adjustment instead.', OLD.id;
  END IF;

  NEW.id := OLD.id;
  NEW.user_id := OLD.user_id;
  NEW.created_at := OLD.created_at;
  NEW.updated_at := now();
  IF NEW.status IN ('settled','refunded','withdrawn') AND NEW.settled_at IS NULL THEN
    NEW.settled_at := now();
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_settled_receipts() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER financial_receipts_immutable
  BEFORE UPDATE ON public.financial_receipts
  FOR EACH ROW EXECUTE FUNCTION public.protect_settled_receipts();

CREATE TRIGGER financial_receipts_no_delete
  BEFORE DELETE ON public.financial_receipts
  FOR EACH ROW EXECUTE FUNCTION public.protect_settled_receipts();

-- Corrections never rewrite history; they are their own entries.
CREATE TABLE public.financial_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id uuid REFERENCES public.financial_receipts(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL,
  amount numeric(14,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  reason text NOT NULL,
  plain_explanation text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX financial_adjustments_user_idx ON public.financial_adjustments (user_id, created_at DESC);

GRANT SELECT ON public.financial_adjustments TO authenticated;
GRANT ALL ON public.financial_adjustments TO service_role;

ALTER TABLE public.financial_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read their own adjustments"
  ON public.financial_adjustments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all adjustments"
  ON public.financial_adjustments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role));