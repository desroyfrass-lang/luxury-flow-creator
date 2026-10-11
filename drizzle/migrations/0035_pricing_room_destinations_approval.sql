-- Destination-specific Pricing Room worksheets + auditable Founder approval.
-- Existing rows (all destination 'US') keep their data; key becomes (product_id, destination).
ALTER TABLE public.pricing_room_worksheets DROP CONSTRAINT pricing_room_worksheets_pkey;
ALTER TABLE public.pricing_room_worksheets ADD CONSTRAINT pricing_room_worksheets_pkey PRIMARY KEY (product_id, destination);
ALTER TABLE public.pricing_room_worksheets ADD CONSTRAINT pricing_room_worksheets_destination_check CHECK (destination IN ('US','CA','GB','JM'));
ALTER TABLE public.pricing_room_worksheets
  ADD COLUMN created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN revision integer NOT NULL DEFAULT 1,
  ADD COLUMN approval_status text NOT NULL DEFAULT 'draft' CHECK (approval_status IN ('draft','approved','revised_after_approval')),
  ADD COLUMN approved_revision integer,
  ADD COLUMN approved_by uuid,
  ADD COLUMN approved_at timestamptz,
  ADD COLUMN approved_snapshot jsonb;

CREATE OR REPLACE FUNCTION public.guard_pricing_worksheet()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE _approving boolean := coalesce(current_setting('frass.pricing_approval', true), '') = 'on';
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_at := now(); NEW.updated_at := now(); NEW.revision := 1;
    IF auth.uid() IS NOT NULL THEN NEW.updated_by := auth.uid(); END IF;
    NEW.approval_status := 'draft'; NEW.approved_revision := NULL; NEW.approved_by := NULL;
    NEW.approved_at := NULL; NEW.approved_snapshot := NULL;
    RETURN NEW;
  END IF;
  IF NEW.product_id <> OLD.product_id OR NEW.destination <> OLD.destination THEN
    RAISE EXCEPTION 'Pricing worksheet product and destination cannot change.';
  END IF;
  NEW.created_at := OLD.created_at;
  IF NOT _approving THEN
    NEW.approval_status := OLD.approval_status; NEW.approved_revision := OLD.approved_revision;
    NEW.approved_by := OLD.approved_by; NEW.approved_at := OLD.approved_at; NEW.approved_snapshot := OLD.approved_snapshot;
    NEW.revision := OLD.revision;
    IF NEW.final_price IS DISTINCT FROM OLD.final_price OR NEW.inputs IS DISTINCT FROM OLD.inputs THEN
      NEW.revision := OLD.revision + 1;
      IF OLD.approval_status = 'approved' THEN NEW.approval_status := 'revised_after_approval'; END IF;
      NEW.updated_at := now();
      IF auth.uid() IS NOT NULL THEN NEW.updated_by := auth.uid(); END IF;
    ELSE
      -- Idempotent re-save: no revision bump, keep the original save time.
      NEW.updated_at := OLD.updated_at; NEW.updated_by := OLD.updated_by;
      NEW.summary := CASE WHEN NEW.summary IS DISTINCT FROM OLD.summary THEN NEW.summary ELSE OLD.summary END;
    END IF;
  ELSE
    NEW.revision := OLD.revision; NEW.final_price := OLD.final_price; NEW.inputs := OLD.inputs;
    NEW.updated_at := OLD.updated_at; NEW.updated_by := OLD.updated_by;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER guard_pricing_worksheet BEFORE INSERT OR UPDATE ON public.pricing_room_worksheets
  FOR EACH ROW EXECUTE FUNCTION public.guard_pricing_worksheet();

CREATE TABLE public.pricing_approval_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.canonical_products(id) ON DELETE CASCADE,
  destination text NOT NULL CHECK (destination IN ('US','CA','GB','JM')),
  revision integer NOT NULL,
  action text NOT NULL CHECK (action IN ('approved')),
  actor uuid NOT NULL,
  note text,
  snapshot jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pricing_approval_events TO authenticated;
GRANT ALL ON public.pricing_approval_events TO service_role;
ALTER TABLE public.pricing_approval_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Founder/admin read pricing approvals" ON public.pricing_approval_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
COMMENT ON TABLE public.pricing_approval_events IS 'Insert-only audit of Founder pricing approvals (written only by founder_approve_pricing_worksheet). Never a product price write.';

CREATE OR REPLACE FUNCTION public.founder_approve_pricing_worksheet(_product_id uuid, _destination text, _expected_revision integer, _snapshot jsonb, _note text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.pricing_room_worksheets;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Only the Founder can approve a price.';
  END IF;
  SELECT * INTO _row FROM public.pricing_room_worksheets WHERE product_id = _product_id AND destination = _destination FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Save the worksheet before approving.'; END IF;
  IF _row.revision <> _expected_revision THEN RAISE EXCEPTION 'The worksheet changed since it was checked. Check it again.'; END IF;
  IF _row.final_price IS NULL THEN RAISE EXCEPTION 'No final selling price saved.'; END IF;
  IF coalesce((_snapshot->>'ready')::boolean, false) IS NOT TRUE THEN RAISE EXCEPTION 'Financial readiness is not met.'; END IF;
  IF _row.approval_status = 'approved' AND _row.approved_revision = _row.revision THEN
    RETURN jsonb_build_object('status','approved','revision',_row.revision,'approved_at',_row.approved_at,'already',true);
  END IF;
  PERFORM set_config('frass.pricing_approval', 'on', true);
  UPDATE public.pricing_room_worksheets SET approval_status = 'approved', approved_revision = _row.revision,
    approved_by = auth.uid(), approved_at = now(), approved_snapshot = _snapshot
    WHERE product_id = _product_id AND destination = _destination;
  PERFORM set_config('frass.pricing_approval', '', true);
  INSERT INTO public.pricing_approval_events(product_id, destination, revision, action, actor, note, snapshot)
    VALUES (_product_id, _destination, _row.revision, 'approved', auth.uid(), left(_note, 1000), _snapshot);
  RETURN jsonb_build_object('status','approved','revision',_row.revision,'approved_at',now(),'already',false);
END $$;
REVOKE ALL ON FUNCTION public.founder_approve_pricing_worksheet(uuid, text, integer, jsonb, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.founder_approve_pricing_worksheet(uuid, text, integer, jsonb, text) TO authenticated;