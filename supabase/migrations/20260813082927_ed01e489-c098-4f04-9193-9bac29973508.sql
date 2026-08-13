ALTER TABLE public.repair_incidents
  ADD COLUMN IF NOT EXISTS resolution_mode TEXT,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resolved_by UUID,
  ADD COLUMN IF NOT EXISTS resolution_note TEXT,
  ADD COLUMN IF NOT EXISTS amendment_ref TEXT,
  ADD COLUMN IF NOT EXISTS amendment_note TEXT;

CREATE OR REPLACE FUNCTION public.stamp_repair_resolution()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.resolution_mode IS NULL THEN
    NEW.resolution_mode := CASE
      WHEN NEW.status = 'auto_repaired' THEN 'automatic'
      WHEN NEW.status = 'escalated' THEN 'escalated'
      WHEN NEW.status = 'resolved' THEN 'manual'
      ELSE NULL
    END;
  END IF;

  IF NEW.status IN ('auto_repaired', 'resolved') AND NEW.resolved_at IS NULL THEN
    NEW.resolved_at := now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS stamp_repair_resolution_trg ON public.repair_incidents;
CREATE TRIGGER stamp_repair_resolution_trg
BEFORE INSERT OR UPDATE ON public.repair_incidents
FOR EACH ROW EXECUTE FUNCTION public.stamp_repair_resolution();

UPDATE public.repair_incidents
SET resolution_mode = CASE
      WHEN status = 'auto_repaired' THEN 'automatic'
      WHEN status = 'escalated' THEN 'escalated'
      WHEN status = 'resolved' THEN 'manual'
      ELSE resolution_mode
    END,
    resolved_at = COALESCE(resolved_at, CASE WHEN status IN ('auto_repaired','resolved') THEN created_at END)
WHERE resolution_mode IS NULL;

CREATE INDEX IF NOT EXISTS repair_incidents_signature_idx ON public.repair_incidents (pattern_signature, created_at DESC);