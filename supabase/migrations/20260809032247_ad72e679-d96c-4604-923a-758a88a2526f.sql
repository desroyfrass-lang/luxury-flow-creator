CREATE TABLE public.live_broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL,
  host_name text NOT NULL DEFAULT 'Frass Builder',
  host_handle text,
  destination text NOT NULL DEFAULT 'for_us',
  purpose text NOT NULL DEFAULT 'community',
  title text NOT NULL,
  summary text,
  status text NOT NULL DEFAULT 'live',
  viewer_count integer NOT NULL DEFAULT 0,
  cover_url text,
  product_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  affiliate_url text,
  scheduled_for timestamptz,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  replay_url text,
  repurposed_as jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.live_broadcasts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.live_broadcasts TO authenticated;
GRANT ALL ON public.live_broadcasts TO service_role;
ALTER TABLE public.live_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Broadcasts are visible to everyone"
  ON public.live_broadcasts FOR SELECT USING (true);
CREATE POLICY "Hosts start their own broadcasts"
  ON public.live_broadcasts FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts manage their own broadcasts"
  ON public.live_broadcasts FOR UPDATE TO authenticated USING (auth.uid() = host_id) WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts remove their own broadcasts"
  ON public.live_broadcasts FOR DELETE TO authenticated USING (auth.uid() = host_id);

CREATE INDEX live_broadcasts_status_idx ON public.live_broadcasts (status, started_at DESC);
CREATE INDEX live_broadcasts_host_idx ON public.live_broadcasts (host_id);

CREATE TRIGGER live_broadcasts_updated_at
  BEFORE UPDATE ON public.live_broadcasts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.live_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id uuid NOT NULL REFERENCES public.live_broadcasts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  author_name text NOT NULL DEFAULT 'Frass Builder',
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.live_comments TO anon;
GRANT SELECT, INSERT, DELETE ON public.live_comments TO authenticated;
GRANT ALL ON public.live_comments TO service_role;
ALTER TABLE public.live_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Live comments are visible to everyone"
  ON public.live_comments FOR SELECT USING (true);
CREATE POLICY "Members comment as themselves"
  ON public.live_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors and hosts remove comments"
  ON public.live_comments FOR DELETE TO authenticated
  USING (
    auth.uid() = author_id
    OR EXISTS (SELECT 1 FROM public.live_broadcasts b WHERE b.id = broadcast_id AND b.host_id = auth.uid())
  );

CREATE INDEX live_comments_broadcast_idx ON public.live_comments (broadcast_id, created_at DESC);

CREATE TABLE public.live_gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id uuid NOT NULL REFERENCES public.live_broadcasts(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_name text NOT NULL DEFAULT 'Frass Builder',
  gift_key text NOT NULL,
  credits integer NOT NULL DEFAULT 0,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.live_gifts TO anon;
GRANT SELECT, INSERT ON public.live_gifts TO authenticated;
GRANT ALL ON public.live_gifts TO service_role;
ALTER TABLE public.live_gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gift wall is visible to everyone"
  ON public.live_gifts FOR SELECT USING (true);
CREATE POLICY "Members send gifts as themselves"
  ON public.live_gifts FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

CREATE INDEX live_gifts_broadcast_idx ON public.live_gifts (broadcast_id, created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.live_broadcasts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_gifts;