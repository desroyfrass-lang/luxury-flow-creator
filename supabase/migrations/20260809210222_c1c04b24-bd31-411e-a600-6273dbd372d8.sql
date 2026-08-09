CREATE TABLE public.fraud_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('fraud','scam','identity_misuse','counterfeit','unauthorized_activity','suspicious_message','other')),
  subject_user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  subject_handle TEXT,
  order_reference TEXT,
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received','investigating','resolved','dismissed')),
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.fraud_reports TO authenticated;
GRANT ALL ON public.fraud_reports TO service_role;

ALTER TABLE public.fraud_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members file their own fraud reports"
ON public.fraud_reports FOR INSERT TO authenticated
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Members read their own fraud reports"
ON public.fraud_reports FOR SELECT TO authenticated
USING (auth.uid() = reporter_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins manage fraud reports"
ON public.fraud_reports FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER fraud_reports_updated_at
BEFORE UPDATE ON public.fraud_reports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX fraud_reports_reporter_idx ON public.fraud_reports (reporter_id, created_at DESC);

CREATE TABLE public.trust_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  badge TEXT NOT NULL CHECK (badge IN ('identity_verified','business_verified','community_verified','frass_verified')),
  note TEXT,
  granted_by UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge)
);

GRANT SELECT ON public.trust_verifications TO anon;
GRANT SELECT ON public.trust_verifications TO authenticated;
GRANT ALL ON public.trust_verifications TO service_role;

ALTER TABLE public.trust_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trust badges are public"
ON public.trust_verifications FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Admins grant trust badges"
ON public.trust_verifications FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TRIGGER trust_verifications_updated_at
BEFORE UPDATE ON public.trust_verifications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();