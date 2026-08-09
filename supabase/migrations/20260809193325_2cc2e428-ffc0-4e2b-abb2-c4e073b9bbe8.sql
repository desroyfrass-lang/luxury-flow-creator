CREATE TABLE public.business_cards (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  headline TEXT,
  job_title TEXT,
  company TEXT,
  hero_media_url TEXT,
  background_url TEXT,
  theme TEXT NOT NULL DEFAULT 'midnight',
  accent TEXT NOT NULL DEFAULT 'gold',
  cta_label TEXT,
  cta_url TEXT,
  website TEXT,
  booking_url TEXT,
  calendar_url TEXT,
  business_hours TEXT,
  location TEXT,
  languages TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  certifications TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  custom_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  section_order TEXT[] NOT NULL DEFAULT ARRAY['story','business','work','links','contact']::TEXT[],
  is_published BOOLEAN NOT NULL DEFAULT true,
  show_contact BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_cards TO authenticated;
GRANT ALL ON public.business_cards TO service_role;

ALTER TABLE public.business_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members manage their own business card"
  ON public.business_cards FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER business_cards_updated_at
  BEFORE UPDATE ON public.business_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.business_card_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX business_card_events_owner_idx
  ON public.business_card_events (card_user_id, created_at DESC);

GRANT SELECT ON public.business_card_events TO authenticated;
GRANT ALL ON public.business_card_events TO service_role;

ALTER TABLE public.business_card_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners read their own card analytics"
  ON public.business_card_events FOR SELECT TO authenticated
  USING (auth.uid() = card_user_id);