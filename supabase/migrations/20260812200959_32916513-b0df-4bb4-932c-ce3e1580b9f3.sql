-- FRASS-0492 — Digital Rights & Content Protection.
-- Extends the existing artwork architecture; no parallel rights service.
ALTER TABLE public.gallery_artworks
  ADD COLUMN IF NOT EXISTS license_grant text NOT NULL DEFAULT 'display_only',
  ADD COLUMN IF NOT EXISTS protection_level text NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS watermark_enabled boolean NOT NULL DEFAULT true;

ALTER TABLE public.gallery_artworks
  DROP CONSTRAINT IF EXISTS gallery_artworks_license_grant_check;
ALTER TABLE public.gallery_artworks
  ADD CONSTRAINT gallery_artworks_license_grant_check
  CHECK (license_grant IN ('display_only','personal_download','commercial_license','nft_ownership','original_physical'));

ALTER TABLE public.gallery_artworks
  DROP CONSTRAINT IF EXISTS gallery_artworks_protection_level_check;
ALTER TABLE public.gallery_artworks
  ADD CONSTRAINT gallery_artworks_protection_level_check
  CHECK (protection_level IN ('open','standard','protected'));

-- FRASS-0493 — Trust & Reputation Engine.
-- Verified experiences only. There is no rating table, no likes, no followers.
CREATE TABLE IF NOT EXISTS public.verified_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid NOT NULL,
  author_id uuid NOT NULL,
  source text NOT NULL CHECK (source IN ('marketplace_order','service','shipping','project','commission')),
  source_id uuid NOT NULL,
  experience text NOT NULL CHECK (experience IN ('positive','mixed','negative')),
  body text CHECK (body IS NULL OR char_length(body) <= 1200),
  is_published boolean NOT NULL DEFAULT true,
  removed_by_founder boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT verified_feedback_not_self CHECK (author_id <> subject_id),
  CONSTRAINT verified_feedback_one_per_transaction UNIQUE (source, source_id, author_id)
);

CREATE INDEX IF NOT EXISTS verified_feedback_subject_idx
  ON public.verified_feedback (subject_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE ON public.verified_feedback TO authenticated;
GRANT SELECT ON public.verified_feedback TO anon;
GRANT ALL ON public.verified_feedback TO service_role;

ALTER TABLE public.verified_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published verified feedback is readable"
  ON public.verified_feedback FOR SELECT
  USING (is_published = true AND removed_by_founder = false);

CREATE POLICY "Authors read their own feedback"
  ON public.verified_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Subjects read feedback about themselves"
  ON public.verified_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = subject_id);

-- Insert authority is proved by a real, completed transaction (checked in the trigger below).
CREATE POLICY "Authors write their own verified feedback"
  ON public.verified_feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors may withdraw their own feedback"
  ON public.verified_feedback FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Founder governs verified feedback"
  ON public.verified_feedback FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Only a genuine, completed Frass transaction can produce feedback.
CREATE OR REPLACE FUNCTION public.enforce_verified_feedback()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  proven boolean := false;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- The words of a customer are never rewritten. Only withdrawal is allowed.
    IF NEW.body IS DISTINCT FROM OLD.body
       OR NEW.experience IS DISTINCT FROM OLD.experience
       OR NEW.subject_id IS DISTINCT FROM OLD.subject_id
       OR NEW.author_id IS DISTINCT FROM OLD.author_id
       OR NEW.source IS DISTINCT FROM OLD.source
       OR NEW.source_id IS DISTINCT FROM OLD.source_id THEN
      IF NOT (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')) THEN
        RAISE EXCEPTION 'Verified feedback cannot be rewritten after it is left.';
      END IF;
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
  END IF;

  IF NEW.source IN ('marketplace_order','service','shipping') THEN
    SELECT EXISTS (
      SELECT 1 FROM public.card_orders o
      WHERE o.id = NEW.source_id
        AND o.seller_id = NEW.subject_id
        AND o.buyer_id = NEW.author_id
        AND o.status IN ('paid','fulfilled','completed')
    ) INTO proven;
  ELSIF NEW.source = 'commission' THEN
    SELECT EXISTS (
      SELECT 1 FROM public.commission_requests c
      WHERE c.id = NEW.source_id
        AND c.artist_id = NEW.subject_id
        AND c.client_id = NEW.author_id
        AND c.status IN ('accepted','completed','delivered')
    ) INTO proven;
  ELSIF NEW.source = 'project' THEN
    SELECT EXISTS (
      SELECT 1 FROM public.payment_requests p
      WHERE p.id = NEW.source_id
        AND p.seller_id = NEW.subject_id
        AND p.status IN ('paid','completed','settled')
    ) INTO proven;
  END IF;

  IF NOT proven THEN
    RAISE EXCEPTION 'Feedback requires a completed Frass transaction between these two members.';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enforce_verified_feedback() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enforce_verified_feedback_trg ON public.verified_feedback;
CREATE TRIGGER enforce_verified_feedback_trg
  BEFORE INSERT OR UPDATE ON public.verified_feedback
  FOR EACH ROW EXECUTE FUNCTION public.enforce_verified_feedback();