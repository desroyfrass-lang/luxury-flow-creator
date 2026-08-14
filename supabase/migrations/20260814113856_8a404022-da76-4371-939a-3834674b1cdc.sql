-- 1) live_broadcasts: hide host_id from anonymous visitors
REVOKE SELECT ON public.live_broadcasts FROM anon;
GRANT SELECT (id, host_name, host_handle, destination, purpose, title, summary, status,
  viewer_count, cover_url, product_links, affiliate_url, scheduled_for, started_at,
  ended_at, replay_url, repurposed_as, created_at, updated_at) ON public.live_broadcasts TO anon;

-- 2) live_comments: hide author_id from anonymous visitors
REVOKE SELECT ON public.live_comments FROM anon;
GRANT SELECT (id, broadcast_id, author_name, author_handle, body, created_at) ON public.live_comments TO anon;

-- 3) live_gifts: hide sender_id and all monetary/private fields from anonymous visitors
REVOKE SELECT ON public.live_gifts FROM anon;
GRANT SELECT (id, broadcast_id, sender_name, sender_handle, gift_key, created_at) ON public.live_gifts TO anon;

-- 4) daily_layout_presets: anonymous visitors have no business reading member layouts
DROP POLICY IF EXISTS "Shared layouts are readable" ON public.daily_layout_presets;
CREATE POLICY "Shared layouts are readable by members"
  ON public.daily_layout_presets FOR SELECT TO authenticated
  USING (shared = true OR owner_id = auth.uid());
REVOKE ALL ON public.daily_layout_presets FROM anon;

-- 5) commission_requests: validate anonymous submissions server-side
CREATE OR REPLACE FUNCTION public.validate_commission_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.requester_name := btrim(coalesce(NEW.requester_name, ''));
  NEW.requester_email := lower(btrim(coalesce(NEW.requester_email, '')));

  IF char_length(NEW.requester_name) < 2 OR char_length(NEW.requester_name) > 80 THEN
    RAISE EXCEPTION 'Please enter a name between 2 and 80 characters.';
  END IF;

  IF NEW.requester_email !~ '^[^@\s]+@[^@\s.]+\.[^@\s]{2,}$' OR char_length(NEW.requester_email) > 254 THEN
    RAISE EXCEPTION 'Please enter a valid email address.';
  END IF;

  IF char_length(coalesce(NEW.brief, '')) < 10 OR char_length(coalesce(NEW.brief, '')) > 4000 THEN
    RAISE EXCEPTION 'Please describe the commission in 10 to 4000 characters.';
  END IF;

  IF NEW.reference_url IS NOT NULL AND NEW.reference_url !~* '^https://' THEN
    RAISE EXCEPTION 'Reference links must start with https://.';
  END IF;

  IF NEW.budget_min IS NOT NULL AND NEW.budget_min < 0 THEN
    RAISE EXCEPTION 'Budget cannot be negative.';
  END IF;
  IF NEW.budget_max IS NOT NULL AND NEW.budget_min IS NOT NULL AND NEW.budget_max < NEW.budget_min THEN
    RAISE EXCEPTION 'Maximum budget must be at least the minimum budget.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_commission_request_trg ON public.commission_requests;
CREATE TRIGGER validate_commission_request_trg
  BEFORE INSERT ON public.commission_requests
  FOR EACH ROW EXECUTE FUNCTION public.validate_commission_request();