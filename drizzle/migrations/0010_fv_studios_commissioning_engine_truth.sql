-- FV Studios commissioning pass 1: canonical production identity,
-- Frass-native engine ownership, and verified-output credit truth.

-- 1. Canonical production identity bridge (additive, nullable).
ALTER TABLE public.studio_projects
  ADD COLUMN IF NOT EXISTS production_id UUID REFERENCES public.studio_productions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS studio_projects_production_id_idx
  ON public.studio_projects (production_id);

-- 2. Engine ownership on the provider registry. Existing rows read as external.
ALTER TABLE public.studio_providers
  ADD COLUMN IF NOT EXISTS engine_type TEXT NOT NULL DEFAULT 'external_fallback';

ALTER TABLE public.studio_providers
  DROP CONSTRAINT IF EXISTS studio_providers_engine_type_check;
ALTER TABLE public.studio_providers
  ADD CONSTRAINT studio_providers_engine_type_check
  CHECK (engine_type IN ('frass_native', 'external_fallback'));

-- 3. Verified-output fields on the existing job table (no duplicate tables).
ALTER TABLE public.studio_generation_jobs
  ADD COLUMN IF NOT EXISTS engine_type TEXT NOT NULL DEFAULT 'external_fallback',
  ADD COLUMN IF NOT EXISTS engine_slug TEXT,
  ADD COLUMN IF NOT EXISTS verified_output_url TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS charge_state TEXT NOT NULL DEFAULT 'unbilled',
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

ALTER TABLE public.studio_generation_jobs
  DROP CONSTRAINT IF EXISTS studio_generation_jobs_charge_state_check;
ALTER TABLE public.studio_generation_jobs
  ADD CONSTRAINT studio_generation_jobs_charge_state_check
  CHECK (charge_state IN ('unbilled', 'charged', 'waived'));

CREATE UNIQUE INDEX IF NOT EXISTS studio_generation_jobs_idempotency_key_uidx
  ON public.studio_generation_jobs (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- 4. Operations record which job they belong to and whether output was verified.
ALTER TABLE public.studio_operations
  ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES public.studio_generation_jobs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS blocked_reason TEXT;
