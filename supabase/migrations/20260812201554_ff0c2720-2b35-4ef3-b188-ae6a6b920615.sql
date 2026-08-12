-- FRASS-0493 — card_orders identifies the buyer by email, not by account id.
-- Proof of a real transaction therefore means: the author owns the email on the order.
CREATE OR REPLACE FUNCTION public.enforce_verified_feedback()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  proven boolean := false;
  author_email text;
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

  SELECT lower(u.email) INTO author_email FROM auth.users u WHERE u.id = NEW.author_id;

  IF NEW.source IN ('marketplace_order','service','shipping') THEN
    SELECT EXISTS (
      SELECT 1 FROM public.card_orders o
      WHERE o.id = NEW.source_id
        AND o.seller_id = NEW.subject_id
        AND author_email IS NOT NULL
        AND lower(o.buyer_email) = author_email
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