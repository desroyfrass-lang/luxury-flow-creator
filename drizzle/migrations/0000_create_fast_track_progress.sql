-- Fast Track progress belongs to the Builder's account, never the browser.
CREATE TABLE public.fast_track_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  -- Stable Fast Track identity: ft.<vault-key>.<step-slug>
  track_key text NOT NULL,
  -- The Vault the step belongs to (always known).
  vault_key text NOT NULL,
  -- Stable Step 1 catalogue Money Move id, ONLY where safely determinable.
  parent_move_id text,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fast_track_progress_status_check CHECK (status IN ('active','done')),
  CONSTRAINT fast_track_progress_owner_track_unique UNIQUE (owner_id, track_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fast_track_progress TO authenticated;
GRANT ALL ON public.fast_track_progress TO service_role;

ALTER TABLE public.fast_track_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Builders read their own Fast Track progress"
  ON public.fast_track_progress FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Builders record their own Fast Track progress"
  ON public.fast_track_progress FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Builders update their own Fast Track progress"
  ON public.fast_track_progress FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Builders delete their own Fast Track progress"
  ON public.fast_track_progress FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

CREATE INDEX fast_track_progress_owner_status_idx
  ON public.fast_track_progress (owner_id, status, updated_at DESC);

CREATE TRIGGER fast_track_progress_touch
  BEFORE UPDATE ON public.fast_track_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();