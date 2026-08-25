-- FRASS-0601 — Frassy Studios Build 2: the Production Engine.
-- Extends the Build 1 foundation. Nothing existing is dropped or renamed.

-- 1. PRODUCTION BRIEF -------------------------------------------------------
CREATE TABLE public.studio_briefs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  production_id UUID NOT NULL REFERENCES public.studio_productions(id) ON DELETE CASCADE,
  series_id UUID REFERENCES public.studio_series(id) ON DELETE SET NULL,
  working_title TEXT NOT NULL DEFAULT '',
  episode_number INTEGER,
  season INTEGER,
  production_type TEXT NOT NULL DEFAULT 'full_episode',
  audience TEXT,
  age_group TEXT,
  objective TEXT,
  story_concept TEXT,
  characters TEXT,
  locations TEXT,
  target_duration_seconds INTEGER,
  target_platforms TEXT[] NOT NULL DEFAULT '{}',
  visual_direction TEXT,
  voice_direction TEXT,
  music_direction TEXT,
  educational_objective TEXT,
  special_instructions TEXT,
  source_request TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  revision_count INTEGER NOT NULL DEFAULT 0,
  generated_by TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_studio_briefs_production ON public.studio_briefs(production_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studio_briefs TO authenticated;
GRANT ALL ON public.studio_briefs TO service_role;
ALTER TABLE public.studio_briefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Studio staff manage briefs" ON public.studio_briefs
  FOR ALL TO authenticated USING (public.is_studio_staff()) WITH CHECK (public.is_studio_staff());

-- 2. EPISODE DEVELOPMENT ----------------------------------------------------
CREATE TABLE public.studio_episode_development (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  production_id UUID NOT NULL REFERENCES public.studio_productions(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  is_current BOOLEAN NOT NULL DEFAULT true,
  concept TEXT,
  synopsis TEXT,
  story_beats JSONB NOT NULL DEFAULT '[]'::jsonb,
  character_roles JSONB NOT NULL DEFAULT '[]'::jsonb,
  locations JSONB NOT NULL DEFAULT '[]'::jsonb,
  continuity_connections JSONB NOT NULL DEFAULT '[]'::jsonb,
  educational_objective TEXT,
  content_opportunities JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  approved_at TIMESTAMPTZ,
  notes TEXT,
  generated_by TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_studio_dev_production ON public.studio_episode_development(production_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studio_episode_development TO authenticated;
GRANT ALL ON public.studio_episode_development TO service_role;
ALTER TABLE public.studio_episode_development ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Studio staff manage development" ON public.studio_episode_development
  FOR ALL TO authenticated USING (public.is_studio_staff()) WITH CHECK (public.is_studio_staff());

-- 3. SCRIPTS ----------------------------------------------------------------
CREATE TABLE public.studio_scripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  production_id UUID NOT NULL REFERENCES public.studio_productions(id) ON DELETE CASCADE,
  title TEXT,
  format TEXT NOT NULL DEFAULT 'screenplay',
  body TEXT NOT NULL DEFAULT '',
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1,
  word_count INTEGER NOT NULL DEFAULT 0,
  approved_at TIMESTAMPTZ,
  generated_by TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_studio_scripts_one_per_production ON public.studio_scripts(production_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studio_scripts TO authenticated;
GRANT ALL ON public.studio_scripts TO service_role;
ALTER TABLE public.studio_scripts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Studio staff manage scripts" ON public.studio_scripts
  FOR ALL TO authenticated USING (public.is_studio_staff()) WITH CHECK (public.is_studio_staff());

CREATE TABLE public.studio_script_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  script_id UUID NOT NULL REFERENCES public.studio_scripts(id) ON DELETE CASCADE,
  production_id UUID REFERENCES public.studio_productions(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  change_note TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_studio_script_versions_script ON public.studio_script_versions(script_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studio_script_versions TO authenticated;
GRANT ALL ON public.studio_script_versions TO service_role;
ALTER TABLE public.studio_script_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Studio staff manage script versions" ON public.studio_script_versions
  FOR ALL TO authenticated USING (public.is_studio_staff()) WITH CHECK (public.is_studio_staff());

-- 4. SCENE VERSIONS (content history, distinct from media versions) ---------
CREATE TABLE public.studio_scene_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scene_id UUID NOT NULL REFERENCES public.studio_scenes(id) ON DELETE CASCADE,
  production_id UUID REFERENCES public.studio_productions(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  change_note TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_studio_scene_versions_scene ON public.studio_scene_versions(scene_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studio_scene_versions TO authenticated;
GRANT ALL ON public.studio_scene_versions TO service_role;
ALTER TABLE public.studio_scene_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Studio staff manage scene versions" ON public.studio_scene_versions
  FOR ALL TO authenticated USING (public.is_studio_staff()) WITH CHECK (public.is_studio_staff());

-- 5. VOICE LIBRARY ----------------------------------------------------------
CREATE TABLE public.studio_voices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  character_id UUID REFERENCES public.studio_characters(id) ON DELETE SET NULL,
  series_id UUID REFERENCES public.studio_series(id) ON DELETE SET NULL,
  language TEXT NOT NULL DEFAULT 'English',
  accent TEXT,
  age_presentation TEXT,
  tone TEXT,
  sample_url TEXT,
  reference_notes TEXT,
  provider TEXT,
  model_reference TEXT,
  rights_status TEXT NOT NULL DEFAULT 'pending_review',
  reuse_allowed BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_studio_voices_character ON public.studio_voices(character_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studio_voices TO authenticated;
GRANT ALL ON public.studio_voices TO service_role;
ALTER TABLE public.studio_voices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Studio staff manage voices" ON public.studio_voices
  FOR ALL TO authenticated USING (public.is_studio_staff()) WITH CHECK (public.is_studio_staff());

-- 6. ANIMATION LIBRARY ------------------------------------------------------
CREATE TABLE public.studio_animations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'movement',
  description TEXT,
  character_id UUID REFERENCES public.studio_characters(id) ON DELETE SET NULL,
  series_id UUID REFERENCES public.studio_series(id) ON DELETE SET NULL,
  preview_url TEXT,
  file_url TEXT,
  duration_seconds NUMERIC,
  loopable BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] NOT NULL DEFAULT '{}',
  rights_status TEXT NOT NULL DEFAULT 'frass_owned',
  reuse_allowed BOOLEAN NOT NULL DEFAULT true,
  approved BOOLEAN NOT NULL DEFAULT false,
  times_used INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_studio_animations_category ON public.studio_animations(category);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studio_animations TO authenticated;
GRANT ALL ON public.studio_animations TO service_role;
ALTER TABLE public.studio_animations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Studio staff manage animations" ON public.studio_animations
  FOR ALL TO authenticated USING (public.is_studio_staff()) WITH CHECK (public.is_studio_staff());

-- 7. GENERATION PROVIDERS (configuration only — nothing purchased) ----------
CREATE TABLE public.studio_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  capabilities TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'not_configured',
  enabled BOOLEAN NOT NULL DEFAULT false,
  secret_name TEXT,
  quality_rating INTEGER,
  speed_rating INTEGER,
  cost_rating INTEGER,
  character_consistency BOOLEAN NOT NULL DEFAULT false,
  commercial_rights TEXT NOT NULL DEFAULT 'unknown',
  priority INTEGER NOT NULL DEFAULT 100,
  founder_preferred BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studio_providers TO authenticated;
GRANT ALL ON public.studio_providers TO service_role;
ALTER TABLE public.studio_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Studio staff manage providers" ON public.studio_providers
  FOR ALL TO authenticated USING (public.is_studio_staff()) WITH CHECK (public.is_studio_staff());

INSERT INTO public.studio_providers (slug, label, capabilities, status, enabled, commercial_rights, priority, notes) VALUES
  ('lovable_text', 'Frass built-in writing', ARRAY['textGeneration'], 'available', true, 'frass_owned', 10, 'Frassy''s own writing engine. Already available — used for briefs, development, scripts, scene breakdowns and continuity.'),
  ('image_provider_slot', 'Image generation (not configured)', ARRAY['imageGeneration'], 'not_configured', false, 'unknown', 50, 'Reserved slot. No service purchased or connected.'),
  ('video_provider_slot', 'Video generation (not configured)', ARRAY['videoGeneration'], 'not_configured', false, 'unknown', 50, 'Reserved slot. No service purchased or connected.'),
  ('animation_provider_slot', 'Animation generation (not configured)', ARRAY['animationGeneration'], 'not_configured', false, 'unknown', 50, 'Reserved slot. No service purchased or connected.'),
  ('voice_provider_slot', 'Voice generation (not configured)', ARRAY['voiceGeneration'], 'not_configured', false, 'unknown', 50, 'Reserved slot. No service purchased or connected.'),
  ('music_provider_slot', 'Music generation (not configured)', ARRAY['musicGeneration'], 'not_configured', false, 'unknown', 50, 'Reserved slot. No service purchased or connected.'),
  ('sound_provider_slot', 'Sound effects (not configured)', ARRAY['soundGeneration'], 'not_configured', false, 'unknown', 50, 'Reserved slot. No service purchased or connected.');

-- 8. CONTINUITY FINDINGS ----------------------------------------------------
CREATE TABLE public.studio_continuity_findings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  production_id UUID NOT NULL REFERENCES public.studio_productions(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES public.studio_scenes(id) ON DELETE SET NULL,
  severity TEXT NOT NULL DEFAULT 'warning',
  area TEXT NOT NULL DEFAULT 'canon',
  summary TEXT NOT NULL,
  detail TEXT,
  conflicts_with TEXT,
  suggestion TEXT,
  resolution TEXT NOT NULL DEFAULT 'open',
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_studio_continuity_production ON public.studio_continuity_findings(production_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studio_continuity_findings TO authenticated;
GRANT ALL ON public.studio_continuity_findings TO service_role;
ALTER TABLE public.studio_continuity_findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Studio staff manage continuity" ON public.studio_continuity_findings
  FOR ALL TO authenticated USING (public.is_studio_staff()) WITH CHECK (public.is_studio_staff());

-- 9. MASTER PRODUCTIONS -----------------------------------------------------
CREATE TABLE public.studio_masters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  production_id UUID NOT NULL REFERENCES public.studio_productions(id) ON DELETE CASCADE,
  series_id UUID REFERENCES public.studio_series(id) ON DELETE SET NULL,
  episode_number INTEGER,
  version INTEGER NOT NULL DEFAULT 1,
  runtime_seconds INTEGER,
  scene_count INTEGER NOT NULL DEFAULT 0,
  master_media_url TEXT,
  captions_url TEXT,
  audio_tracks JSONB NOT NULL DEFAULT '[]'::jsonb,
  thumbnail_url TEXT,
  rights_status TEXT NOT NULL DEFAULT 'pending_review',
  rights_blockers JSONB NOT NULL DEFAULT '[]'::jsonb,
  approval_status TEXT NOT NULL DEFAULT 'not_approved',
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_studio_masters_production ON public.studio_masters(production_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studio_masters TO authenticated;
GRANT ALL ON public.studio_masters TO service_role;
ALTER TABLE public.studio_masters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Studio staff manage masters" ON public.studio_masters
  FOR ALL TO authenticated USING (public.is_studio_staff()) WITH CHECK (public.is_studio_staff());

-- 10. PLATFORM PACKAGES -----------------------------------------------------
CREATE TABLE public.studio_platform_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  production_id UUID NOT NULL REFERENCES public.studio_productions(id) ON DELETE CASCADE,
  master_id UUID REFERENCES public.studio_masters(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  derivative_type TEXT,
  title TEXT,
  description TEXT,
  caption TEXT,
  hashtags TEXT[] NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,
  captions_url TEXT,
  video_url TEXT,
  content_classification TEXT,
  series_reference TEXT,
  episode_reference TEXT,
  rights_status TEXT NOT NULL DEFAULT 'pending_review',
  monetization_ready BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft',
  approved_at TIMESTAMPTZ,
  queued_at TIMESTAMPTZ,
  generated_by TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_studio_packages_production ON public.studio_platform_packages(production_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studio_platform_packages TO authenticated;
GRANT ALL ON public.studio_platform_packages TO service_role;
ALTER TABLE public.studio_platform_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Studio staff manage packages" ON public.studio_platform_packages
  FOR ALL TO authenticated USING (public.is_studio_staff()) WITH CHECK (public.is_studio_staff());

-- 11. PRODUCTION MEMORY -----------------------------------------------------
CREATE TABLE public.studio_production_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scope TEXT NOT NULL DEFAULT 'production',
  series_id UUID REFERENCES public.studio_series(id) ON DELETE CASCADE,
  production_id UUID REFERENCES public.studio_productions(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES public.studio_scenes(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  importance INTEGER NOT NULL DEFAULT 5,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_studio_memory_scope ON public.studio_production_memory(scope, series_id, production_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studio_production_memory TO authenticated;
GRANT ALL ON public.studio_production_memory TO service_role;
ALTER TABLE public.studio_production_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Studio staff manage production memory" ON public.studio_production_memory
  FOR ALL TO authenticated USING (public.is_studio_staff()) WITH CHECK (public.is_studio_staff());

-- 12. GENERATION JOB QUEUE FIELDS ------------------------------------------
ALTER TABLE public.studio_generation_jobs
  ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS queued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS estimated_cost_credits NUMERIC,
  ADD COLUMN IF NOT EXISTS actual_cost_credits NUMERIC,
  ADD COLUMN IF NOT EXISTS output JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS asset_id UUID,
  ADD COLUMN IF NOT EXISTS target_kind TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 13. UPDATED-AT TRIGGERS ---------------------------------------------------
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'studio_briefs','studio_episode_development','studio_scripts','studio_voices',
    'studio_animations','studio_providers','studio_continuity_findings','studio_masters',
    'studio_platform_packages','studio_production_memory','studio_generation_jobs'
  ] LOOP
    EXECUTE format(
      'CREATE TRIGGER set_%1$s_updated_at BEFORE UPDATE ON public.%1$s FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t);
  END LOOP;
END $$;