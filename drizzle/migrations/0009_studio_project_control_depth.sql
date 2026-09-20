-- FRASS-0407 / A1 — remember which control depth a production is shown at.
-- Additive and nullable: existing productions keep working and default to Directed.
ALTER TABLE public.studio_projects
  ADD COLUMN IF NOT EXISTS control_depth TEXT NOT NULL DEFAULT 'directed';

ALTER TABLE public.studio_projects
  DROP CONSTRAINT IF EXISTS studio_projects_control_depth_check;

ALTER TABLE public.studio_projects
  ADD CONSTRAINT studio_projects_control_depth_check
  CHECK (control_depth IN ('directed', 'creator', 'producer', 'pro'));