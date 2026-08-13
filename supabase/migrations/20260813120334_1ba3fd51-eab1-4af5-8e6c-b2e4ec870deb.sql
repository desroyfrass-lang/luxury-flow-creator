ALTER TABLE public.member_success_blueprints
  ADD COLUMN IF NOT EXISTS creative_projects jsonb NOT NULL DEFAULT '[]'::jsonb;