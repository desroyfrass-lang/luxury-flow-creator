-- FRASS-0490 Founding Partner Program -------------------------------------
-- Extends the existing Partner architecture. Recognition only; never permissions.

INSERT INTO public.launch_program_settings (id, enabled, notice)
VALUES ('founding_program', true, 'The founding period is open. Only the Founder may invite Founding Partners.')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE public.founding_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  sequence integer NOT NULL,
  invited_at timestamp with time zone NOT NULL DEFAULT now(),
  accepted_at timestamp with time zone,
  invited_by uuid,
  note text,
  visibility text NOT NULL DEFAULT 'partners'
    CHECK (visibility IN ('public','partners','private')),
  show_on_card boolean NOT NULL DEFAULT true,
  story_why text,
  story_hoped text,
  story_journey text,
  story_lessons text,
  story_public boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX founding_partners_sequence_key ON public.founding_partners (sequence);

GRANT SELECT ON public.founding_partners TO anon;
GRANT SELECT, UPDATE ON public.founding_partners TO authenticated;
GRANT ALL ON public.founding_partners TO service_role;

ALTER TABLE public.founding_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public founding partners are visible to everyone"
ON public.founding_partners FOR SELECT
USING (visibility = 'public');

CREATE POLICY "Members see partners-only and their own record"
ON public.founding_partners FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR visibility IN ('public','partners')
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Founding partners manage their own visibility and story"
ON public.founding_partners FOR UPDATE TO authenticated
USING (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  user_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Only the Founder grants founding recognition"
ON public.founding_partners FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Only the Founder removes founding recognition"
ON public.founding_partners FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

-- The honour record itself is Founder-owned; members own only voice + visibility.
CREATE OR REPLACE FUNCTION public.protect_founding_partner_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  is_founder boolean;
  period_open boolean;
BEGIN
  is_founder := auth.uid() IS NULL
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'super_admin'::app_role);

  IF TG_OP = 'INSERT' THEN
    SELECT s.enabled INTO period_open
    FROM public.launch_program_settings s WHERE s.id = 'founding_program';

    IF NOT COALESCE(period_open, false) THEN
      RAISE EXCEPTION 'The founding period is closed. Reopen it to recognise another Founding Partner.';
    END IF;

    IF NOT is_founder THEN
      RAISE EXCEPTION 'Founding Partner recognition can only be granted by the Founder.';
    END IF;

    NEW.invited_by := COALESCE(NEW.invited_by, auth.uid());
    NEW.sequence := COALESCE(
      (SELECT MAX(f.sequence) + 1 FROM public.founding_partners f), 1);
    RETURN NEW;
  END IF;

  NEW.updated_at := now();

  IF is_founder THEN
    RETURN NEW;
  END IF;

  -- A member may only change how they are seen and what they say.
  NEW.id := OLD.id;
  NEW.user_id := OLD.user_id;
  NEW.sequence := OLD.sequence;
  NEW.invited_at := OLD.invited_at;
  NEW.invited_by := OLD.invited_by;
  NEW.note := OLD.note;
  NEW.created_at := OLD.created_at;

  -- Accepting is a one-way act the member performs once.
  IF OLD.accepted_at IS NOT NULL THEN
    NEW.accepted_at := OLD.accepted_at;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER founding_partners_protect
BEFORE INSERT OR UPDATE ON public.founding_partners
FOR EACH ROW EXECUTE FUNCTION public.protect_founding_partner_record();

CREATE TRIGGER founding_partners_touch_updated_at
BEFORE UPDATE ON public.founding_partners
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();