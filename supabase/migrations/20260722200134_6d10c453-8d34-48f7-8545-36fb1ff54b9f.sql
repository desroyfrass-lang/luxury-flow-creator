
-- ============================================================
-- Spec 041 — Phase 1: Merchandise foundation
-- Slogans, logo treatments, POD providers, blanks, proposals
-- No publishing yet — review + approval infrastructure only.
-- ============================================================

-- Enums --------------------------------------------------------
CREATE TYPE public.slogan_source AS ENUM ('ai_generated', 'founder', 'site_import', 'partner_submitted');
CREATE TYPE public.slogan_status AS ENUM ('draft', 'under_review', 'approved', 'rejected', 'retired');
CREATE TYPE public.logo_placement AS ENUM ('chest_left', 'chest_center', 'back_center', 'sleeve', 'hem', 'pocket', 'all_over', 'embroidery_chest', 'embroidery_sleeve', 'other');
CREATE TYPE public.pod_provider_status AS ENUM ('available', 'connected', 'disabled');
CREATE TYPE public.merch_quality_tier AS ENUM ('signature', 'premium', 'standard', 'experimental');
CREATE TYPE public.merch_proposal_status AS ENUM ('proposed', 'under_review', 'approved', 'adjusted', 'skipped', 'rejected', 'published', 'retired');

-- Shared updated_at trigger already exists as public.update_updated_at_column()

-- =========================================================
-- Slogans
-- =========================================================
CREATE TABLE public.slogans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  normalized_text TEXT GENERATED ALWAYS AS (lower(regexp_replace(text, '[^a-zA-Z0-9]+', '', 'g'))) STORED,
  source public.slogan_source NOT NULL DEFAULT 'ai_generated',
  status public.slogan_status NOT NULL DEFAULT 'draft',
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  brand_voice_notes TEXT,
  origin_note TEXT,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX slogans_normalized_uniq ON public.slogans (normalized_text);
CREATE INDEX slogans_status_idx ON public.slogans (status);
CREATE INDEX slogans_source_idx ON public.slogans (source);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.slogans TO authenticated;
GRANT ALL ON public.slogans TO service_role;
ALTER TABLE public.slogans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read slogans" ON public.slogans FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'designer'));
CREATE POLICY "Staff can insert slogans" ON public.slogans FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'designer'));
CREATE POLICY "Admin/staff can update slogans" ON public.slogans FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admin can delete slogans" ON public.slogans FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER slogans_updated_at BEFORE UPDATE ON public.slogans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- Logo treatments
-- =========================================================
CREATE TABLE public.logo_treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  placement public.logo_placement NOT NULL,
  asset_url TEXT NOT NULL,
  asset_variant TEXT,
  color_treatment TEXT,
  size_mm NUMERIC,
  print_method TEXT,
  notes TEXT,
  status public.slogan_status NOT NULL DEFAULT 'draft',
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX logo_treatments_status_idx ON public.logo_treatments (status);
CREATE INDEX logo_treatments_placement_idx ON public.logo_treatments (placement);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.logo_treatments TO authenticated;
GRANT ALL ON public.logo_treatments TO service_role;
ALTER TABLE public.logo_treatments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff read logo treatments" ON public.logo_treatments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'designer'));
CREATE POLICY "Staff insert logo treatments" ON public.logo_treatments FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'designer'));
CREATE POLICY "Admin/staff update logo treatments" ON public.logo_treatments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admin delete logo treatments" ON public.logo_treatments FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER logo_treatments_updated_at BEFORE UPDATE ON public.logo_treatments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- POD providers (provider-agnostic registry)
-- =========================================================
CREATE TABLE public.pod_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status public.pod_provider_status NOT NULL DEFAULT 'available',
  is_default BOOLEAN NOT NULL DEFAULT false,
  config JSONB NOT NULL DEFAULT '{}'::JSONB,
  notes TEXT,
  connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX pod_providers_one_default ON public.pod_providers (is_default) WHERE is_default = true;

GRANT SELECT ON public.pod_providers TO authenticated;
GRANT ALL ON public.pod_providers TO service_role;
ALTER TABLE public.pod_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff read pod providers" ON public.pod_providers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'designer'));
CREATE POLICY "Admin manage pod providers insert" ON public.pod_providers FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage pod providers update" ON public.pod_providers FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage pod providers delete" ON public.pod_providers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER pod_providers_updated_at BEFORE UPDATE ON public.pod_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed providers (Printful default; others available for later)
INSERT INTO public.pod_providers (slug, name, status, is_default, notes) VALUES
  ('printful', 'Printful', 'available', true, 'Primary provider (Phase 2 integration).'),
  ('printify', 'Printify', 'available', false, 'Reserved — provider-agnostic add-on.'),
  ('gelato',   'Gelato',   'available', false, 'Reserved — provider-agnostic add-on.');

-- =========================================================
-- Merch blanks (provider catalog cache)
-- =========================================================
CREATE TABLE public.merch_blanks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.pod_providers(id) ON DELETE CASCADE,
  provider_blank_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  base_cost NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  fabric TEXT,
  weight_gsm INTEGER,
  colors TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  sizes TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  quality_score NUMERIC(4,2),
  quality_tier public.merch_quality_tier,
  sample_ordered_at TIMESTAMPTZ,
  sample_verdict TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  status TEXT NOT NULL DEFAULT 'catalog',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider_id, provider_blank_id)
);
CREATE INDEX merch_blanks_provider_idx ON public.merch_blanks (provider_id);
CREATE INDEX merch_blanks_quality_idx ON public.merch_blanks (quality_tier);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.merch_blanks TO authenticated;
GRANT ALL ON public.merch_blanks TO service_role;
ALTER TABLE public.merch_blanks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff read blanks" ON public.merch_blanks FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'designer'));
CREATE POLICY "Admin/staff write blanks" ON public.merch_blanks FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admin/staff update blanks" ON public.merch_blanks FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admin delete blanks" ON public.merch_blanks FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER merch_blanks_updated_at BEFORE UPDATE ON public.merch_blanks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- Merchandise proposals (the daily queue)
-- =========================================================
CREATE TABLE public.merch_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  concept TEXT,
  slogan_id UUID REFERENCES public.slogans(id) ON DELETE SET NULL,
  logo_treatment_id UUID REFERENCES public.logo_treatments(id) ON DELETE SET NULL,
  blank_id UUID REFERENCES public.merch_blanks(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES public.pod_providers(id) ON DELETE SET NULL,
  quality_tier public.merch_quality_tier NOT NULL DEFAULT 'standard',
  status public.merch_proposal_status NOT NULL DEFAULT 'proposed',
  target_collection TEXT,
  season TEXT,
  mockup_urls TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  artwork_notes TEXT,
  reviewer_notes TEXT,
  adjustments JSONB NOT NULL DEFAULT '{}'::JSONB,
  quality_score NUMERIC(4,2),
  proposed_price NUMERIC(10,2),
  proposed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX merch_proposals_status_idx ON public.merch_proposals (status);
CREATE INDEX merch_proposals_slogan_idx ON public.merch_proposals (slogan_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.merch_proposals TO authenticated;
GRANT ALL ON public.merch_proposals TO service_role;
ALTER TABLE public.merch_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff read proposals" ON public.merch_proposals FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'designer'));
CREATE POLICY "Staff insert proposals" ON public.merch_proposals FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff') OR public.has_role(auth.uid(), 'designer'));
CREATE POLICY "Admin/staff update proposals" ON public.merch_proposals FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'staff'));
CREATE POLICY "Admin delete proposals" ON public.merch_proposals FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER merch_proposals_updated_at BEFORE UPDATE ON public.merch_proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
