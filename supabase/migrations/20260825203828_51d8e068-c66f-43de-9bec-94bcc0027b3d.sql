-- FRASS-0602 — Frass Distribution Network (Build 3)
-- Extends Build 1/2 studio tables. No duplicate tables where extension works.

-- 1. PLATFORM ACCOUNTS: studio_platform_connections already holds one row per
-- account, so it is extended (not duplicated) to support many accounts per platform.
ALTER TABLE public.studio_platform_connections
  ADD COLUMN IF NOT EXISTS scopes TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS capabilities TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS revenue_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_error TEXT,
  ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS credentials_configured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS content_kinds TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE public.studio_platform_connections DROP CONSTRAINT IF EXISTS studio_platform_connections_platform_key;
CREATE INDEX IF NOT EXISTS idx_studio_conn_platform ON public.studio_platform_connections(platform);
CREATE UNIQUE INDEX IF NOT EXISTS idx_studio_conn_account ON public.studio_platform_connections(platform, external_account_id) WHERE external_account_id IS NOT NULL;

-- 2. SERVER-ONLY CREDENTIAL VAULT — never readable by the browser.
CREATE TABLE IF NOT EXISTS public.studio_platform_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID NOT NULL REFERENCES public.studio_platform_connections(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  access_token_ref TEXT,
  refresh_token_ref TEXT,
  expires_at TIMESTAMPTZ,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  platform_user_id TEXT,
  external_account_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_studio_creds_conn ON public.studio_platform_credentials(connection_id);
REVOKE ALL ON public.studio_platform_credentials FROM anon, authenticated;
GRANT ALL ON public.studio_platform_credentials TO service_role;
ALTER TABLE public.studio_platform_credentials ENABLE ROW LEVEL SECURITY;

-- 3. PLATFORM CAPABILITY REGISTRY
CREATE TABLE IF NOT EXISTS public.studio_platform_capabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  capability TEXT NOT NULL,
  supported BOOLEAN NOT NULL DEFAULT false,
  requires_platform_review BOOLEAN NOT NULL DEFAULT false,
  requires_credentials BOOLEAN NOT NULL DEFAULT true,
  note TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (platform, capability)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studio_platform_capabilities TO authenticated;
GRANT ALL ON public.studio_platform_capabilities TO service_role;
ALTER TABLE public.studio_platform_capabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Studio staff manage capabilities" ON public.studio_platform_capabilities
  FOR ALL TO authenticated USING (public.is_studio_staff()) WITH CHECK (public.is_studio_staff());

-- 4. CONTENT IDENTITY + DEFAULT DESTINATIONS
ALTER TABLE public.studio_productions
  ADD COLUMN IF NOT EXISTS content_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_studio_productions_content_id ON public.studio_productions(content_id) WHERE content_id IS NOT NULL;
ALTER TABLE public.studio_production_derivatives
  ADD COLUMN IF NOT EXISTS content_id TEXT;
ALTER TABLE public.studio_series
  ADD COLUMN IF NOT EXISTS default_destinations JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 5. PUBLISH JOBS — extended into full distribution jobs
ALTER TABLE public.studio_publish_jobs
  ADD COLUMN IF NOT EXISTS connection_id UUID REFERENCES public.studio_platform_connections(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES public.studio_platform_packages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS derivative_production_id UUID REFERENCES public.studio_productions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS timezone TEXT,
  ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'schedule',
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS external_id TEXT,
  ADD COLUMN IF NOT EXISTS external_url TEXT,
  ADD COLUMN IF NOT EXISTS blocked_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS attention_reason TEXT,
  ADD COLUMN IF NOT EXISTS consent_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_by UUID;
CREATE UNIQUE INDEX IF NOT EXISTS idx_studio_publish_idem ON public.studio_publish_jobs(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_studio_publish_sched ON public.studio_publish_jobs(scheduled_for);

-- 6. PUBLICATION RECORD — the permanent link
ALTER TABLE public.studio_publications
  ADD COLUMN IF NOT EXISTS connection_id UUID REFERENCES public.studio_platform_connections(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES public.studio_publish_jobs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES public.studio_platform_packages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS derivative_production_id UUID REFERENCES public.studio_productions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS master_production_id UUID REFERENCES public.studio_productions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS content_id TEXT,
  ADD COLUMN IF NOT EXISTS account_label TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'live',
  ADD COLUMN IF NOT EXISTS removal_status TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS removed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS distribution_stopped BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS monetization_status TEXT NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS last_analytics_sync_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;

-- 7. ANALYTICS + MONETIZATION SNAPSHOTS
ALTER TABLE public.studio_platform_analytics
  ADD COLUMN IF NOT EXISTS connection_id UUID REFERENCES public.studio_platform_connections(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS average_view_duration_seconds NUMERIC,
  ADD COLUMN IF NOT EXISTS likes INTEGER,
  ADD COLUMN IF NOT EXISTS subscribers_lost INTEGER,
  ADD COLUMN IF NOT EXISTS engaged_views INTEGER,
  ADD COLUMN IF NOT EXISTS raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS metric_source TEXT,
  ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.studio_monetization
  ADD COLUMN IF NOT EXISTS connection_id UUID REFERENCES public.studio_platform_connections(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS publication_id UUID REFERENCES public.studio_publications(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS availability TEXT NOT NULL DEFAULT 'unavailable',
  ADD COLUMN IF NOT EXISTS estimated_ad_revenue NUMERIC,
  ADD COLUMN IF NOT EXISTS monetized_playbacks INTEGER,
  ADD COLUMN IF NOT EXISTS cpm NUMERIC,
  ADD COLUMN IF NOT EXISTS raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;

-- 8. SYNCHRONISATION RUNS
CREATE TABLE IF NOT EXISTS public.studio_sync_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID REFERENCES public.studio_platform_connections(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'analytics',
  status TEXT NOT NULL DEFAULT 'queued',
  items_synced INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  error TEXT,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_studio_sync_runs_conn ON public.studio_sync_runs(connection_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studio_sync_runs TO authenticated;
GRANT ALL ON public.studio_sync_runs TO service_role;
ALTER TABLE public.studio_sync_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Studio staff manage sync runs" ON public.studio_sync_runs
  FOR ALL TO authenticated USING (public.is_studio_staff()) WITH CHECK (public.is_studio_staff());

-- 9. TAKEDOWN / DISTRIBUTION CONTROL
CREATE TABLE IF NOT EXISTS public.studio_takedowns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publication_id UUID NOT NULL REFERENCES public.studio_publications(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested',
  reason TEXT,
  requested_by UUID,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  result TEXT
);
CREATE INDEX IF NOT EXISTS idx_studio_takedowns_pub ON public.studio_takedowns(publication_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studio_takedowns TO authenticated;
GRANT ALL ON public.studio_takedowns TO service_role;
ALTER TABLE public.studio_takedowns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Studio staff manage takedowns" ON public.studio_takedowns
  FOR ALL TO authenticated USING (public.is_studio_staff()) WITH CHECK (public.is_studio_staff());

-- 10. CAPABILITY REGISTRY SEED (declared support, credentials still required)
INSERT INTO public.studio_platform_capabilities (platform, capability, supported, requires_platform_review, requires_credentials, note) VALUES
  ('youtube','upload_video', true,false,true,'Resumable upload through the official YouTube Data API.'),
  ('youtube','direct_publish', true,false,true,'Privacy status decides public visibility.'),
  ('youtube','schedule', true,false,true,null),
  ('youtube','thumbnail', true,false,true,'Custom thumbnails need a verified channel.'),
  ('youtube','captions', true,false,true,null),
  ('youtube','analytics', true,false,true,'YouTube Analytics API.'),
  ('youtube','revenue_data', true,true,true,'Only for channels in the YouTube Partner Program with monetary scope granted.'),
  ('tiktok','upload_video', true,false,true,'Content Posting API.'),
  ('tiktok','draft_upload', true,false,true,'Send to TikTok inbox for final review.'),
  ('tiktok','direct_publish', false,true,true,'Direct posting needs TikTok audit approval of the app and account.'),
  ('tiktok','analytics', true,true,true,'Requires research/display scopes.'),
  ('tiktok','revenue_data', false,true,true,'TikTok does not expose creator revenue to this integration.'),
  ('instagram','publish_reel', true,false,true,'Professional account through the Instagram Graph API.'),
  ('instagram','publish_image', true,false,true,null),
  ('instagram','publish_carousel', true,false,true,null),
  ('instagram','schedule', false,false,true,'Scheduling is held internally, then published at the chosen time.'),
  ('instagram','analytics', true,false,true,'Insights for professional accounts.'),
  ('instagram','revenue_data', false,true,true,null),
  ('facebook','upload_video', true,false,true,'Page video publishing.'),
  ('facebook','publish_reel', true,false,true,null),
  ('facebook','schedule', true,false,true,null),
  ('facebook','analytics', true,false,true,'Page insights.'),
  ('facebook','revenue_data', false,true,true,'Only for Pages enrolled in monetization with the right permissions.'),
  ('frass_hill','upload_video', true,false,false,'Internal Frass feed — no external credentials needed.'),
  ('frass_hill','direct_publish', true,false,false,null),
  ('frass_hill','publish_image', true,false,false,null),
  ('frass_hill','schedule', true,false,false,null),
  ('frass_hill','analytics', true,false,false,'Frass-owned view counts.'),
  ('frass_hill','revenue_data', false,false,false,'Frass Hill revenue is tracked in the Financial Center, not here.')
ON CONFLICT (platform, capability) DO NOTHING;

-- 11. INTERNAL FRASS FEEDS as real destinations (no external credentials required)
INSERT INTO public.studio_platform_connections (platform, status, account_label, external_account_id, publishing_enabled, analytics_enabled, revenue_enabled, credentials_configured, health, content_kinds)
SELECT 'frass_hill','connected','Frassy Street','frass:feed:frassy-street', true, true, false, true, 'healthy', ARRAY['video','image']
WHERE NOT EXISTS (SELECT 1 FROM public.studio_platform_connections WHERE external_account_id = 'frass:feed:frassy-street');
INSERT INTO public.studio_platform_connections (platform, status, account_label, external_account_id, publishing_enabled, analytics_enabled, revenue_enabled, credentials_configured, health, content_kinds)
SELECT 'frass_hill','connected','Frass Hill Feed','frass:feed:frass-hill', true, true, false, true, 'healthy', ARRAY['video','image']
WHERE NOT EXISTS (SELECT 1 FROM public.studio_platform_connections WHERE external_account_id = 'frass:feed:frass-hill');

-- 12. External placeholders are honest: setup required, never "connected".
UPDATE public.studio_platform_connections
SET status = 'setup_required', credentials_configured = false
WHERE platform <> 'frass_hill' AND credentials_configured = false AND status NOT IN ('connected','needs_reauthorization','connection_error');
