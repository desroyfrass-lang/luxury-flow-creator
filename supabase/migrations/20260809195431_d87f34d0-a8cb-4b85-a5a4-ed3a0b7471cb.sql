ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referred_by uuid,
  ADD COLUMN IF NOT EXISTS referred_via text;

CREATE TABLE public.link_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'link',
  stage text NOT NULL DEFAULT 'signed_up',
  landing_path text,
  qualified_member_at timestamptz,
  qualified_affiliate_at timestamptz,
  qualified_partner_at timestamptz,
  business_launched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (invited_user_id)
);

GRANT SELECT ON public.link_referrals TO authenticated;
GRANT ALL ON public.link_referrals TO service_role;

ALTER TABLE public.link_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members see people they introduced"
  ON public.link_referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = invited_user_id);

CREATE INDEX link_referrals_referrer_idx ON public.link_referrals (referrer_id, created_at DESC);

CREATE TABLE public.recruitment_bonuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_id uuid REFERENCES public.link_referrals(id) ON DELETE SET NULL,
  kind text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'pending',
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (referral_id, kind)
);

GRANT SELECT ON public.recruitment_bonuses TO authenticated;
GRANT ALL ON public.recruitment_bonuses TO service_role;

ALTER TABLE public.recruitment_bonuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members see their own recruitment bonuses"
  ON public.recruitment_bonuses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX recruitment_bonuses_user_idx ON public.recruitment_bonuses (user_id, created_at DESC);

CREATE TRIGGER update_link_referrals_updated_at
  BEFORE UPDATE ON public.link_referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recruitment_bonuses_updated_at
  BEFORE UPDATE ON public.recruitment_bonuses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();