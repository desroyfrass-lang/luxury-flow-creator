-- FRASS-0600 — Frassy Studios foundation (Founder/Admin only).
CREATE OR REPLACE FUNCTION public.is_studio_staff()
RETURNS boolean LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'super_admin'::app_role)
$$;

CREATE TABLE public.studio_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  audience text,
  age_group text,
  tone text,
  status text NOT NULL DEFAULT 'active',
  cover_url text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.studio_series_bibles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid NOT NULL UNIQUE REFERENCES public.studio_series(id) ON DELETE CASCADE,
  world_rules text,
  visual_style text,
  story_rules text,
  character_relationships text,
  locations text,
  recurring_objects text,
  canon_events text,
  timeline text,
  previous_episodes text,
  unresolved_storylines text,
  forbidden_changes text,
  language_style text,
  educational_standards text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.studio_characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid REFERENCES public.studio_series(id) ON DELETE SET NULL,
  name text NOT NULL,
  role text,
  description text,
  personality text,
  age text,
  appearance text,
  wardrobe text,
  expressions text,
  voice text,
  accent text,
  speech_style text,
  relationships text,
  animation_references text,
  approved_poses text,
  continuity_notes text,
  primary_image_url text,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.studio_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid REFERENCES public.studio_series(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  visual_prompt text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.studio_productions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid REFERENCES public.studio_series(id) ON DELETE SET NULL,
  title text NOT NULL,
  episode_number integer,
  season integer,
  production_type text NOT NULL DEFAULT 'full_episode',
  status text NOT NULL DEFAULT 'idea',
  audience text,
  age_group text,
  destinations text[] NOT NULL DEFAULT '{}',
  aspect_ratio text NOT NULL DEFAULT '16:9',
  target_duration_seconds integer,
  concept text,
  story_goal text,
  educational_objective text,
  characters text,
  location text,
  mood text,
  visual_style text,
  music_direction text,
  narrator text,
  special_instructions text,
  cover_url text,
  is_master boolean NOT NULL DEFAULT true,
  master_production_id uuid REFERENCES public.studio_productions(id) ON DELETE SET NULL,
  rights_status text NOT NULL DEFAULT 'frass_owned',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.studio_scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  production_id uuid NOT NULL REFERENCES public.studio_productions(id) ON DELETE CASCADE,
  scene_number integer NOT NULL DEFAULT 1,
  title text,
  duration_seconds integer,
  script text,
  dialogue text,
  narration text,
  characters text[] NOT NULL DEFAULT '{}',
  location text,
  camera_direction text,
  visual_prompt text,
  audio_notes text,
  music text,
  sfx text,
  animation_notes text,
  asset_url text,
  generation_status text NOT NULL DEFAULT 'not_started',
  approval_status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.studio_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  asset_type text NOT NULL,
  series_id uuid REFERENCES public.studio_series(id) ON DELETE SET NULL,
  file_url text,
  ownership text NOT NULL DEFAULT 'frass_kicks',
  rights_status text NOT NULL DEFAULT 'frass_owned',
  source text,
  generation_info jsonb NOT NULL DEFAULT '{}'::jsonb,
  approved boolean NOT NULL DEFAULT false,
  reuse_allowed boolean NOT NULL DEFAULT true,
  tags text[] NOT NULL DEFAULT '{}',
  last_used_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.studio_character_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL REFERENCES public.studio_characters(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES public.studio_assets(id) ON DELETE CASCADE,
  kind text,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.studio_asset_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES public.studio_assets(id) ON DELETE CASCADE,
  production_id uuid REFERENCES public.studio_productions(id) ON DELETE CASCADE,
  scene_id uuid REFERENCES public.studio_scenes(id) ON DELETE CASCADE,
  used_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.studio_generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  production_id uuid REFERENCES public.studio_productions(id) ON DELETE CASCADE,
  scene_id uuid REFERENCES public.studio_scenes(id) ON DELETE CASCADE,
  job_type text NOT NULL,
  provider text,
  model_reference text,
  status text NOT NULL DEFAULT 'queued',
  prompt text,
  cost_credits numeric NOT NULL DEFAULT 0,
  reused_asset_id uuid REFERENCES public.studio_assets(id) ON DELETE SET NULL,
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.studio_generation_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id uuid NOT NULL REFERENCES public.studio_scenes(id) ON DELETE CASCADE,
  job_id uuid REFERENCES public.studio_generation_jobs(id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1,
  asset_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.studio_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  production_id uuid REFERENCES public.studio_productions(id) ON DELETE CASCADE,
  scene_id uuid REFERENCES public.studio_scenes(id) ON DELETE CASCADE,
  reviewer_id uuid,
  decision text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.studio_platform_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'not_connected',
  account_label text,
  external_account_id text,
  publishing_enabled boolean NOT NULL DEFAULT false,
  analytics_enabled boolean NOT NULL DEFAULT false,
  monetization_enabled boolean NOT NULL DEFAULT false,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  health text NOT NULL DEFAULT 'unknown',
  last_sync_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.studio_publish_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  production_id uuid NOT NULL REFERENCES public.studio_productions(id) ON DELETE CASCADE,
  platform text NOT NULL,
  account_label text,
  format text,
  scheduled_for timestamptz,
  status text NOT NULL DEFAULT 'not_ready',
  monetization_eligibility text NOT NULL DEFAULT 'unknown',
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.studio_publications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  production_id uuid NOT NULL REFERENCES public.studio_productions(id) ON DELETE CASCADE,
  platform text NOT NULL,
  external_id text,
  external_url text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.studio_platform_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id uuid REFERENCES public.studio_publications(id) ON DELETE CASCADE,
  production_id uuid REFERENCES public.studio_productions(id) ON DELETE CASCADE,
  platform text NOT NULL,
  period_start date,
  period_end date,
  views bigint NOT NULL DEFAULT 0,
  monetized_views bigint NOT NULL DEFAULT 0,
  watch_time_minutes numeric NOT NULL DEFAULT 0,
  completion_rate numeric,
  engagements bigint NOT NULL DEFAULT 0,
  shares bigint NOT NULL DEFAULT 0,
  comments bigint NOT NULL DEFAULT 0,
  subscribers_gained bigint NOT NULL DEFAULT 0,
  click_through_rate numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.studio_monetization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  production_id uuid REFERENCES public.studio_productions(id) ON DELETE CASCADE,
  platform text NOT NULL,
  account_label text,
  status text NOT NULL DEFAULT 'unknown',
  views bigint NOT NULL DEFAULT 0,
  monetized_views bigint NOT NULL DEFAULT 0,
  watch_time_minutes numeric NOT NULL DEFAULT 0,
  revenue numeric NOT NULL DEFAULT 0,
  rpm numeric,
  currency text NOT NULL DEFAULT 'USD',
  period_start date,
  period_end date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.studio_production_derivatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_production_id uuid NOT NULL REFERENCES public.studio_productions(id) ON DELETE CASCADE,
  derivative_production_id uuid NOT NULL REFERENCES public.studio_productions(id) ON DELETE CASCADE,
  derivative_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (master_production_id, derivative_production_id)
);

CREATE TABLE public.studio_rights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type text NOT NULL,
  subject_id uuid NOT NULL,
  rights_status text NOT NULL DEFAULT 'pending_review',
  ownership text,
  provider text,
  model_reference text,
  generation_date timestamptz,
  prompt_reference text,
  source_assets jsonb NOT NULL DEFAULT '[]'::jsonb,
  parent_asset_id uuid REFERENCES public.studio_assets(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.studio_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  subject_type text,
  subject_id uuid,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'studio_series','studio_series_bibles','studio_characters','studio_locations',
    'studio_productions','studio_scenes','studio_assets','studio_character_assets',
    'studio_asset_usage','studio_generation_jobs','studio_generation_versions','studio_reviews',
    'studio_platform_connections','studio_publish_jobs','studio_publications',
    'studio_platform_analytics','studio_monetization','studio_production_derivatives',
    'studio_rights','studio_activity_log'
  ] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY "Founder and admins manage %1$s" ON public.%1$I FOR ALL TO authenticated USING (public.is_studio_staff()) WITH CHECK (public.is_studio_staff())', t);
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = t AND column_name = 'updated_at'
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER %1$s_updated_at BEFORE UPDATE ON public.%1$I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t);
    END IF;
  END LOOP;
END $$;

CREATE INDEX idx_studio_productions_series ON public.studio_productions(series_id);
CREATE INDEX idx_studio_productions_status ON public.studio_productions(status);
CREATE INDEX idx_studio_scenes_production ON public.studio_scenes(production_id, scene_number);
CREATE INDEX idx_studio_assets_type ON public.studio_assets(asset_type);
CREATE INDEX idx_studio_publish_jobs_status ON public.studio_publish_jobs(status);

INSERT INTO public.studio_series (slug, name, description, audience, age_group, tone) VALUES
  ('frost-chronicles','Frost Chronicles','The flagship animated saga of Frass Hill.','General Audience','General Audience','Cinematic, warm, adventurous'),
  ('frost-street','Frost Street','Street-level stories from the Frass District.','Teen','Teen','Streetwear, energetic'),
  ('frosty-street','Frosty Street','Lighter companion stories on Frosty Street.','General Audience','6-12','Playful, bright'),
  ('frassy-street','Frassy Street','Frassy hosts and explains life on the Hill.','General Audience','General Audience','Caribbean warmth, wit'),
  ('kids-programming','Kids Programming','Learning and play for the youngest builders.','Kids','3-6','Gentle, joyful, educational'),
  ('i-am-not-my-hair','I Am Not My Hair','Identity, confidence and culture.','Adult','Adult','Honest, beautiful, cultural'),
  ('frass-kicks','Frass Kicks','Product films and brand storytelling.','General Audience','General Audience','Luxury, chrome and gold'),
  ('promotional-content','Promotional Content','Campaign and promotional pieces.','General Audience','General Audience','Sharp, persuasive');

INSERT INTO public.studio_series_bibles (series_id)
SELECT id FROM public.studio_series;

INSERT INTO public.studio_platform_connections (platform) VALUES
  ('youtube'),('tiktok'),('instagram'),('facebook'),('frass_hill');