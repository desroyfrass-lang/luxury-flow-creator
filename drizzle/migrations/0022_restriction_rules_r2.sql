CREATE TABLE public.restriction_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_level text NOT NULL CHECK (target_level IN ('variant','offer','listing','category','vendor')),
  target_ref text NOT NULL CHECK (length(target_ref) BETWEEN 1 AND 300),
  country text NOT NULL CHECK (country ~ '^[A-Z]{2}$'),
  subdivision text CHECK (subdivision IS NULL OR (subdivision ~ '^[A-Z]{2}-[A-Z0-9]{1,3}$' AND left(subdivision,2) = country)),
  effect text NOT NULL CHECK (effect IN ('allow','prohibit')),
  reason text NOT NULL CHECK (reason IN ('legal_prohibition','shipping_unavailable','age_gated','needs_review','verified_permitted')),
  applies_to text NOT NULL DEFAULT 'both' CHECK (applies_to IN ('product','service','both')),
  min_age integer CHECK (min_age IS NULL OR min_age BETWEEN 1 AND 120),
  evidence_source text,
  evidence_reference text,
  verified_at timestamptz,
  expires_at timestamptz,
  approval text NOT NULL DEFAULT 'pending' CHECK (approval IN ('pending','approved','rejected')),
  approved_by uuid,
  approved_at timestamptz,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX restriction_rules_country_idx ON public.restriction_rules (country, approval);

GRANT SELECT, INSERT, UPDATE ON public.restriction_rules TO authenticated;
GRANT ALL ON public.restriction_rules TO service_role;
REVOKE ALL ON public.restriction_rules FROM anon;
ALTER TABLE public.restriction_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founder reads restriction rules" ON public.restriction_rules
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Founder drafts restriction rules" ON public.restriction_rules
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') AND created_by = auth.uid());
CREATE POLICY "Founder edits restriction rules" ON public.restriction_rules
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.restriction_rule_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid NOT NULL,
  action text NOT NULL,
  actor uuid,
  snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX restriction_rule_history_rule_idx ON public.restriction_rule_history (rule_id, created_at);
GRANT SELECT ON public.restriction_rule_history TO authenticated;
GRANT ALL ON public.restriction_rule_history TO service_role;
REVOKE ALL ON public.restriction_rule_history FROM anon;
ALTER TABLE public.restriction_rule_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Founder reads restriction history" ON public.restriction_rule_history
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Approval fields can only change inside founder_decide_restriction_rule.
-- Any substantive edit to an approved rule sends it back to pending.
CREATE OR REPLACE FUNCTION public.guard_restriction_rule()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE in_decision boolean := coalesce(current_setting('frass.restriction_decision', true), '') = 'on'
                               AND public.has_role(auth.uid(), 'admin');
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.approval := 'pending'; NEW.approved_by := NULL; NEW.approved_at := NULL;
    NEW.created_by := coalesce(auth.uid(), NEW.created_by);
  ELSE
    NEW.id := OLD.id; NEW.created_by := OLD.created_by; NEW.created_at := OLD.created_at;
    IF NOT in_decision THEN
      NEW.approval := OLD.approval; NEW.approved_by := OLD.approved_by; NEW.approved_at := OLD.approved_at;
      IF (NEW.target_level, NEW.target_ref, NEW.country, NEW.subdivision, NEW.effect, NEW.reason, NEW.applies_to,
          NEW.min_age, NEW.evidence_source, NEW.evidence_reference, NEW.verified_at, NEW.expires_at)
         IS DISTINCT FROM
         (OLD.target_level, OLD.target_ref, OLD.country, OLD.subdivision, OLD.effect, OLD.reason, OLD.applies_to,
          OLD.min_age, OLD.evidence_source, OLD.evidence_reference, OLD.verified_at, OLD.expires_at) THEN
        NEW.approval := 'pending'; NEW.approved_by := NULL; NEW.approved_at := NULL;
      END IF;
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER guard_restriction_rule BEFORE INSERT OR UPDATE ON public.restriction_rules
  FOR EACH ROW EXECUTE FUNCTION public.guard_restriction_rule();

CREATE OR REPLACE FUNCTION public.log_restriction_rule()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.restriction_rule_history(rule_id, action, actor, snapshot)
  VALUES (NEW.id, lower(TG_OP), auth.uid(), to_jsonb(NEW));
  RETURN NEW;
END $$;
CREATE TRIGGER log_restriction_rule AFTER INSERT OR UPDATE ON public.restriction_rules
  FOR EACH ROW EXECUTE FUNCTION public.log_restriction_rule();

CREATE OR REPLACE FUNCTION public.founder_decide_restriction_rule(_rule_id uuid, _decision text, _note text DEFAULT '')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); r record;
BEGIN
  IF uid IS NULL OR NOT public.has_role(uid, 'admin') THEN RAISE EXCEPTION 'Founder access only'; END IF;
  IF _decision NOT IN ('approved','rejected') THEN RAISE EXCEPTION 'Invalid decision'; END IF;
  SELECT * INTO r FROM public.restriction_rules WHERE id = _rule_id FOR UPDATE;
  IF r.id IS NULL THEN RAISE EXCEPTION 'Rule not found'; END IF;
  IF _decision = 'approved' THEN
    IF coalesce(r.evidence_source,'') = '' OR coalesce(r.evidence_reference,'') = '' OR r.verified_at IS NULL THEN
      RAISE EXCEPTION 'Evidence source, reference and verified date are required before approval';
    END IF;
    IF r.reason = 'age_gated' AND r.min_age IS NULL THEN RAISE EXCEPTION 'Age rules need a minimum age'; END IF;
    IF r.expires_at IS NOT NULL AND r.expires_at <= now() THEN RAISE EXCEPTION 'Rule has already expired'; END IF;
  END IF;
  PERFORM set_config('frass.restriction_decision','on',true);
  UPDATE public.restriction_rules SET approval = _decision, approved_by = uid, approved_at = now() WHERE id = _rule_id;
  PERFORM set_config('frass.restriction_decision','',true);
  INSERT INTO public.founder_audit_ledger(user_id, card_key, card_number, card_title, card_path, role, content)
  VALUES (uid, 'restriction-decision:' || _rule_id, 0,
          'Restriction rule ' || _decision || ': ' || r.country || ' ' || r.target_level || ' ' || r.reason,
          '/admin/restrictions', 'user',
          left('Restriction rule ' || _rule_id || ' ' || _decision || '. ' || coalesce(_note,''), 20000));
  RETURN jsonb_build_object('rule_id', _rule_id, 'approval', _decision);
END $$;
REVOKE ALL ON FUNCTION public.founder_decide_restriction_rule(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.founder_decide_restriction_rule(uuid, text, text) TO authenticated;
REVOKE ALL ON FUNCTION public.guard_restriction_rule() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_restriction_rule() FROM PUBLIC, anon, authenticated;