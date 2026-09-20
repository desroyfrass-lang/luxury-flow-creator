CREATE TABLE IF NOT EXISTS public.studio_audio_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), job_id UUID NOT NULL REFERENCES public.studio_generation_jobs(id) ON DELETE CASCADE, production_id UUID NOT NULL REFERENCES public.studio_productions(id) ON DELETE CASCADE, owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, version_kind TEXT NOT NULL CHECK (version_kind IN ('source','a1_clean')), storage_bucket TEXT NOT NULL DEFAULT 'studio-audio', storage_path TEXT NOT NULL, mime_type TEXT NOT NULL, byte_size BIGINT NOT NULL CHECK (byte_size > 0), engine_type TEXT, engine_slug TEXT, engine_version TEXT, processed_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(job_id, version_kind), UNIQUE(storage_bucket, storage_path)
);
CREATE INDEX IF NOT EXISTS studio_audio_versions_production_idx ON public.studio_audio_versions(production_id, created_at DESC);
CREATE INDEX IF NOT EXISTS studio_audio_versions_owner_idx ON public.studio_audio_versions(owner_id, created_at DESC);
ALTER TABLE public.studio_audio_versions ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.studio_audio_versions TO authenticated;
GRANT ALL ON public.studio_audio_versions TO service_role;
CREATE POLICY "Members read own studio audio versions" ON public.studio_audio_versions FOR SELECT TO authenticated USING (owner_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.studio_a1_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), production_id UUID NOT NULL REFERENCES public.studio_productions(id) ON DELETE CASCADE, check_id TEXT NOT NULL CHECK (check_id IN ('source','input-clean','picture','sound','rights','master-file')), state TEXT NOT NULL CHECK (state IN ('unknown','blocked','passed')), note TEXT, job_id UUID REFERENCES public.studio_generation_jobs(id) ON DELETE SET NULL, asset_id UUID REFERENCES public.studio_assets(id) ON DELETE SET NULL, machine_slug TEXT, verified_at TIMESTAMPTZ, created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(production_id, check_id)
);
ALTER TABLE public.studio_a1_evidence ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.studio_a1_evidence TO authenticated;
GRANT ALL ON public.studio_a1_evidence TO service_role;
CREATE POLICY "Members read own studio A1 evidence" ON public.studio_a1_evidence FOR SELECT TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Members upload own studio audio" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'studio-audio' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Members read own studio audio" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'studio-audio' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Members delete own unverified studio audio" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'studio-audio' AND (storage.foldername(name))[1] = auth.uid()::text AND NOT EXISTS (SELECT 1 FROM public.studio_audio_versions v WHERE v.storage_bucket = bucket_id AND v.storage_path = name));

INSERT INTO public.studio_providers (slug, label, engine_type, capabilities, status, enabled, priority, quality_rating, speed_rating, cost_rating, commercial_rights, notes)
VALUES ('frass_a1_clean_web_audio_v1', 'FRASS Native A1 Clean', 'frass_native', ARRAY['audioRestoration'], 'available', true, 1, 3, 4, 5, 'frass_operated', 'Browser runtime; deterministic Web Audio DSP; engine version 1.0.0; no external provider.')
ON CONFLICT (slug) DO UPDATE SET label=EXCLUDED.label, engine_type=EXCLUDED.engine_type, capabilities=EXCLUDED.capabilities, status=EXCLUDED.status, enabled=EXCLUDED.enabled, priority=EXCLUDED.priority, quality_rating=EXCLUDED.quality_rating, speed_rating=EXCLUDED.speed_rating, cost_rating=EXCLUDED.cost_rating, commercial_rights=EXCLUDED.commercial_rights, notes=EXCLUDED.notes, updated_at=now();