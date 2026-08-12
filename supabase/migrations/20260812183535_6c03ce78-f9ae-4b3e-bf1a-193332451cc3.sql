-- ─────────────────────────────────────────────────────────────────────────────
-- FRASS-0485 / FRASS-0485A — Frass Gallery + Frass Gallery Studio
-- Commerce, receipts, payouts and cards are NOT duplicated here; this stores
-- only the artistic layer (galleries, artworks, stories, commissions, canvases).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Artist galleries ────────────────────────────────────────────────────────
CREATE TABLE public.artist_galleries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  handle TEXT NOT NULL UNIQUE CHECK (handle ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$'),
  display_name TEXT NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 120),
  disciplines TEXT[] NOT NULL DEFAULT '{}',
  biography TEXT CHECK (biography IS NULL OR char_length(biography) <= 8000),
  artist_statement TEXT CHECK (artist_statement IS NULL OR char_length(artist_statement) <= 8000),
  hero_url TEXT,
  avatar_url TEXT,
  location TEXT,
  contact_email TEXT CHECK (contact_email IS NULL OR contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  current_exhibition TEXT,
  commission_status TEXT NOT NULL DEFAULT 'closed'
    CHECK (commission_status IN ('open', 'waitlist', 'closed')),
  commission_note TEXT,
  commission_from_price NUMERIC(12,2) CHECK (commission_from_price IS NULL OR commission_from_price >= 0),
  currency TEXT NOT NULL DEFAULT 'CAD' CHECK (char_length(currency) = 3),
  theme TEXT NOT NULL DEFAULT 'midnight',
  accent TEXT NOT NULL DEFAULT 'gold',
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.artist_galleries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.artist_galleries TO authenticated;
GRANT ALL ON public.artist_galleries TO service_role;
ALTER TABLE public.artist_galleries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published galleries are public"
  ON public.artist_galleries FOR SELECT
  USING (is_published = true OR auth.uid() = user_id);
CREATE POLICY "Artists insert their own gallery"
  ON public.artist_galleries FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Artists update their own gallery"
  ON public.artist_galleries FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Artists delete their own gallery"
  ON public.artist_galleries FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Helper: does this gallery belong to the caller?
CREATE OR REPLACE FUNCTION public.owns_gallery(_gallery_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.artist_galleries g
    WHERE g.id = _gallery_id AND g.user_id = auth.uid()
  )
$$;
REVOKE ALL ON FUNCTION public.owns_gallery(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.owns_gallery(UUID) TO authenticated, service_role;

-- Helper: is this gallery visible to the public?
CREATE OR REPLACE FUNCTION public.gallery_is_public(_gallery_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.artist_galleries g
    WHERE g.id = _gallery_id AND g.is_published = true
  )
$$;
REVOKE ALL ON FUNCTION public.gallery_is_public(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.gallery_is_public(UUID) TO anon, authenticated, service_role;

-- ── Collections ─────────────────────────────────────────────────────────────
CREATE TABLE public.gallery_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gallery_id UUID NOT NULL REFERENCES public.artist_galleries(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 4000),
  cover_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX gallery_collections_gallery_idx ON public.gallery_collections(gallery_id, position);

GRANT SELECT ON public.gallery_collections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_collections TO authenticated;
GRANT ALL ON public.gallery_collections TO service_role;
ALTER TABLE public.gallery_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collections of published galleries are public"
  ON public.gallery_collections FOR SELECT
  USING (public.gallery_is_public(gallery_id) OR public.owns_gallery(gallery_id));
CREATE POLICY "Artists manage their collections"
  ON public.gallery_collections FOR ALL TO authenticated
  USING (public.owns_gallery(gallery_id)) WITH CHECK (public.owns_gallery(gallery_id));

-- ── Artworks ────────────────────────────────────────────────────────────────
CREATE TABLE public.gallery_artworks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gallery_id UUID NOT NULL REFERENCES public.artist_galleries(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES public.gallery_collections(id) ON DELETE SET NULL,
  slug TEXT NOT NULL CHECK (slug ~ '^[a-z0-9][a-z0-9-]{0,78}[a-z0-9]$'),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 8000),
  inspiration TEXT CHECK (inspiration IS NULL OR char_length(inspiration) <= 8000),
  medium TEXT,
  dimensions TEXT,
  year_created INTEGER CHECK (year_created IS NULL OR (year_created BETWEEN 1000 AND 2200)),
  image_url TEXT,
  thumb_url TEXT,
  extra_images TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  availability TEXT NOT NULL DEFAULT 'available'
    CHECK (availability IN ('available', 'reserved', 'sold', 'not_for_sale', 'exhibition_only')),
  currency TEXT NOT NULL DEFAULT 'CAD' CHECK (char_length(currency) = 3),
  original_price NUMERIC(12,2) CHECK (original_price IS NULL OR original_price >= 0),
  prints_available BOOLEAN NOT NULL DEFAULT false,
  print_from_price NUMERIC(12,2) CHECK (print_from_price IS NULL OR print_from_price >= 0),
  edition_size INTEGER CHECK (edition_size IS NULL OR edition_size > 0),
  signed_editions BOOLEAN NOT NULL DEFAULT false,
  digital_download BOOLEAN NOT NULL DEFAULT false,
  digital_price NUMERIC(12,2) CHECK (digital_price IS NULL OR digital_price >= 0),
  license_terms TEXT,
  nft_enabled BOOLEAN NOT NULL DEFAULT false,
  coa_offered BOOLEAN NOT NULL DEFAULT false,
  commissions_similar BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'uploaded' CHECK (source IN ('uploaded', 'frass_studio')),
  studio_canvas_id UUID,
  position INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (gallery_id, slug)
);
CREATE INDEX gallery_artworks_gallery_idx ON public.gallery_artworks(gallery_id, position);
CREATE INDEX gallery_artworks_collection_idx ON public.gallery_artworks(collection_id);

GRANT SELECT ON public.gallery_artworks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_artworks TO authenticated;
GRANT ALL ON public.gallery_artworks TO service_role;
ALTER TABLE public.gallery_artworks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published artworks are public"
  ON public.gallery_artworks FOR SELECT
  USING ((is_published = true AND public.gallery_is_public(gallery_id)) OR public.owns_gallery(gallery_id));
CREATE POLICY "Artists manage their artworks"
  ON public.gallery_artworks FOR ALL TO authenticated
  USING (public.owns_gallery(gallery_id)) WITH CHECK (public.owns_gallery(gallery_id));

-- ── Story Wall ──────────────────────────────────────────────────────────────
CREATE TABLE public.artwork_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artwork_id UUID NOT NULL UNIQUE REFERENCES public.gallery_artworks(id) ON DELETE CASCADE,
  gallery_id UUID NOT NULL REFERENCES public.artist_galleries(id) ON DELETE CASCADE,
  written_story TEXT CHECK (written_story IS NULL OR char_length(written_story) <= 12000),
  audio_url TEXT,
  audio_seconds INTEGER CHECK (audio_seconds IS NULL OR (audio_seconds >= 0 AND audio_seconds <= 3600)),
  creation_notes TEXT CHECK (creation_notes IS NULL OR char_length(creation_notes) <= 8000),
  process_notes TEXT CHECK (process_notes IS NULL OR char_length(process_notes) <= 8000),
  timelapse_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.artwork_stories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.artwork_stories TO authenticated;
GRANT ALL ON public.artwork_stories TO service_role;
ALTER TABLE public.artwork_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stories follow their artwork"
  ON public.artwork_stories FOR SELECT
  USING (
    public.owns_gallery(gallery_id)
    OR EXISTS (
      SELECT 1 FROM public.gallery_artworks a
      WHERE a.id = artwork_id AND a.is_published = true AND public.gallery_is_public(a.gallery_id)
    )
  );
CREATE POLICY "Artists manage their stories"
  ON public.artwork_stories FOR ALL TO authenticated
  USING (public.owns_gallery(gallery_id)) WITH CHECK (public.owns_gallery(gallery_id));

-- ── Commission requests ─────────────────────────────────────────────────────
CREATE TABLE public.commission_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gallery_id UUID NOT NULL REFERENCES public.artist_galleries(id) ON DELETE CASCADE,
  artwork_id UUID REFERENCES public.gallery_artworks(id) ON DELETE SET NULL,
  requester_user_id UUID,
  requester_name TEXT NOT NULL CHECK (char_length(requester_name) BETWEEN 1 AND 120),
  requester_email TEXT NOT NULL CHECK (requester_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  brief TEXT NOT NULL CHECK (char_length(brief) BETWEEN 10 AND 6000),
  reference_url TEXT,
  budget_min NUMERIC(12,2) CHECK (budget_min IS NULL OR budget_min >= 0),
  budget_max NUMERIC(12,2) CHECK (budget_max IS NULL OR budget_max >= 0),
  currency TEXT NOT NULL DEFAULT 'CAD' CHECK (char_length(currency) = 3),
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'discussing', 'quoted', 'accepted', 'declined', 'complete')),
  artist_note TEXT CHECK (artist_note IS NULL OR char_length(artist_note) <= 6000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (budget_max IS NULL OR budget_min IS NULL OR budget_max >= budget_min)
);
CREATE INDEX commission_requests_gallery_idx ON public.commission_requests(gallery_id, created_at DESC);

GRANT INSERT ON public.commission_requests TO anon;
GRANT SELECT, INSERT, UPDATE ON public.commission_requests TO authenticated;
GRANT ALL ON public.commission_requests TO service_role;
ALTER TABLE public.commission_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can request a commission from a published gallery"
  ON public.commission_requests FOR INSERT TO anon, authenticated
  WITH CHECK (
    public.gallery_is_public(gallery_id)
    AND status = 'new'
    AND artist_note IS NULL
    AND (requester_user_id IS NULL OR requester_user_id = auth.uid())
  );
CREATE POLICY "Artists and requesters read commission requests"
  ON public.commission_requests FOR SELECT TO authenticated
  USING (public.owns_gallery(gallery_id) OR requester_user_id = auth.uid());
CREATE POLICY "Artists update commission requests"
  ON public.commission_requests FOR UPDATE TO authenticated
  USING (public.owns_gallery(gallery_id)) WITH CHECK (public.owns_gallery(gallery_id));

-- ── Studio canvases (works in progress from Frass Gallery Studio) ───────────
CREATE TABLE public.studio_canvases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled' CHECK (char_length(title) BETWEEN 1 AND 200),
  width INTEGER NOT NULL DEFAULT 2048 CHECK (width BETWEEN 16 AND 16384),
  height INTEGER NOT NULL DEFAULT 2048 CHECK (height BETWEEN 16 AND 16384),
  preset TEXT,
  thumbnail_url TEXT,
  document JSONB NOT NULL DEFAULT '{}'::jsonb,
  layer_count INTEGER NOT NULL DEFAULT 1 CHECK (layer_count >= 0),
  minutes_spent INTEGER NOT NULL DEFAULT 0 CHECK (minutes_spent >= 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'finished', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX studio_canvases_user_idx ON public.studio_canvases(user_id, updated_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.studio_canvases TO authenticated;
GRANT ALL ON public.studio_canvases TO service_role;
ALTER TABLE public.studio_canvases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artists manage their own canvases"
  ON public.studio_canvases FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── updated_at triggers (reuse the existing shared function) ────────────────
CREATE TRIGGER update_artist_galleries_updated_at BEFORE UPDATE ON public.artist_galleries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gallery_collections_updated_at BEFORE UPDATE ON public.gallery_collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gallery_artworks_updated_at BEFORE UPDATE ON public.gallery_artworks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_artwork_stories_updated_at BEFORE UPDATE ON public.artwork_stories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_commission_requests_updated_at BEFORE UPDATE ON public.commission_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_studio_canvases_updated_at BEFORE UPDATE ON public.studio_canvases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();