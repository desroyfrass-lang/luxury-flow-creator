
-- ===== Notifications =====
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,                 -- 'order', 'reward', 'system', 'mention', ...
  title TEXT NOT NULL,
  body TEXT,
  url TEXT,                           -- optional deep-link
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_created_idx
  ON public.notifications (user_id, created_at DESC);
CREATE INDEX notifications_user_unread_idx
  ON public.notifications (user_id) WHERE read_at IS NULL;

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users mark own notifications read"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins read all notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ===== Platform events (audit log / event bus sink) =====
CREATE TABLE public.platform_events (
  id BIGSERIAL PRIMARY KEY,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,           -- e.g. 'order.placed', 'product.approved'
  entity_type TEXT,                   -- 'order', 'product', 'capsule', ...
  entity_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX platform_events_type_created_idx
  ON public.platform_events (event_type, created_at DESC);
CREATE INDEX platform_events_entity_idx
  ON public.platform_events (entity_type, entity_id);
CREATE INDEX platform_events_actor_idx
  ON public.platform_events (actor_id, created_at DESC);

-- Writes only through trusted server code (service role); admins can read.
GRANT ALL ON public.platform_events TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.platform_events_id_seq TO service_role;
GRANT SELECT ON public.platform_events TO authenticated;

ALTER TABLE public.platform_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read all platform events"
  ON public.platform_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Actors read own events"
  ON public.platform_events FOR SELECT
  TO authenticated
  USING (actor_id = auth.uid());
