CREATE TABLE public.daily_layout_prefs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  prefs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

GRANT SELECT, INSERT, UPDATE ON public.daily_layout_prefs TO authenticated;
GRANT ALL ON public.daily_layout_prefs TO service_role;

ALTER TABLE public.daily_layout_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read their own Daily layout"
ON public.daily_layout_prefs FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Members save their own Daily layout"
ON public.daily_layout_prefs FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members update their own Daily layout"
ON public.daily_layout_prefs FOR UPDATE TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.daily_layout_presets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  prefs jsonb not null,
  shared boolean not null default false,
  created_at timestamptz not null default now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_layout_presets TO authenticated;
GRANT SELECT ON public.daily_layout_presets TO anon;
GRANT ALL ON public.daily_layout_presets TO service_role;

ALTER TABLE public.daily_layout_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members manage their own saved layouts"
ON public.daily_layout_presets FOR ALL TO authenticated
USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Shared layouts are readable"
ON public.daily_layout_presets FOR SELECT TO anon, authenticated
USING (shared = true);

CREATE INDEX daily_layout_presets_owner_idx ON public.daily_layout_presets (owner_id);
CREATE INDEX daily_layout_presets_shared_idx ON public.daily_layout_presets (shared) WHERE shared = true;