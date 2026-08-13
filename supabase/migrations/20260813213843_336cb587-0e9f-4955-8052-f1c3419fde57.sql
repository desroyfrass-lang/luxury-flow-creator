-- 1) Public marketplace read path through RLS instead of an elevated bypass
GRANT SELECT ON public.card_listings TO anon;

DROP POLICY IF EXISTS "Anyone can browse live listings" ON public.card_listings;
CREATE POLICY "Anyone can browse live listings"
ON public.card_listings
FOR SELECT
TO anon, authenticated
USING (status IN ('live', 'sold_out'));

-- 2) First Partners may only change visibility and their story
CREATE OR REPLACE FUNCTION public.protect_founding_partner_self_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin'::app_role)
     OR public.has_role(auth.uid(), 'super_admin'::app_role) THEN
    RETURN NEW;
  END IF;

  IF NEW.user_id IS DISTINCT FROM OLD.user_id
     OR NEW.sequence IS DISTINCT FROM OLD.sequence
     OR NEW.invited_by IS DISTINCT FROM OLD.invited_by
     OR NEW.invited_at IS DISTINCT FROM OLD.invited_at THEN
    RAISE EXCEPTION 'Only the Founder can change founding rank, attribution or invitation dates.';
  END IF;

  -- Accepting is a one-way act: never un-accept, never rewrite an existing date.
  IF OLD.accepted_at IS NOT NULL AND NEW.accepted_at IS DISTINCT FROM OLD.accepted_at THEN
    RAISE EXCEPTION 'Acceptance is recorded once and cannot be changed.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_founding_partner_self_update ON public.founding_partners;
CREATE TRIGGER protect_founding_partner_self_update
BEFORE UPDATE ON public.founding_partners
FOR EACH ROW EXECUTE FUNCTION public.protect_founding_partner_self_update();