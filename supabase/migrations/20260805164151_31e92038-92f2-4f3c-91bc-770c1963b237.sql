-- Builder Identity extension for the profiles table

-- 1. Add Builder identity columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS handle text,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS builder_stage text NOT NULL DEFAULT 'discover',
  ADD COLUMN IF NOT EXISTS primary_district text,
  ADD COLUMN IF NOT EXISTS preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS last_seen_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

-- Unique public handle (conditional)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_handle_unique' AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_handle_unique UNIQUE (handle);
  END IF;
END
$$;

-- Value constraints
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_builder_stage_check,
  ADD CONSTRAINT profiles_builder_stage_check
  CHECK (builder_stage IN ('discover', 'learn', 'create', 'build', 'launch', 'lead', 'teach', 'give_back', 'legacy'));

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_primary_district_check,
  ADD CONSTRAINT profiles_primary_district_check
  CHECK (primary_district IS NULL OR primary_district IN (
    'welcome', 'creation', 'opportunity', 'academy', 'community', 'foundation', 'executive', 'marketplace', 'vault'
  ));

-- 2. GRANTs (idempotent)
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT ON public.profiles TO anon;

-- 3. Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Update the new-user trigger to seed display_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    display_name
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 5. Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Authenticated users can view public profiles'
  ) THEN
    CREATE POLICY "Authenticated users can view public profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (is_public = true OR id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Public profiles are viewable by anon'
  ) THEN
    CREATE POLICY "Public profiles are viewable by anon"
    ON public.profiles
    FOR SELECT
    TO anon
    USING (is_public = true);
  END IF;
END
$$;