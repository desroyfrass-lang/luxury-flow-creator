CREATE TABLE public.platform_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text NOT NULL DEFAULT 'Platform audit',
  status text NOT NULL DEFAULT 'active',
  overall_trust_score smallint,
  report jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE public.platform_audit_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id uuid NOT NULL REFERENCES public.platform_audits(id) ON DELETE CASCADE,
  page_id text NOT NULL,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  trust_score smallint NOT NULL DEFAULT 0,
  findings jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (audit_id, page_id)
);

CREATE INDEX platform_audit_pages_audit_idx ON public.platform_audit_pages(audit_id);
CREATE INDEX platform_audits_user_idx ON public.platform_audits(user_id, started_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_audits TO authenticated;
GRANT ALL ON public.platform_audits TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_audit_pages TO authenticated;
GRANT ALL ON public.platform_audit_pages TO service_role;

ALTER TABLE public.platform_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_audit_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founder manages platform audits"
ON public.platform_audits FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin') AND user_id = auth.uid());

CREATE POLICY "Founder manages platform audit pages"
ON public.platform_audit_pages FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));