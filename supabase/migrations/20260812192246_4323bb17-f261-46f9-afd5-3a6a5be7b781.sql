
CREATE TABLE public.user_passkeys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  transports TEXT[] NOT NULL DEFAULT '{}',
  device_label TEXT NOT NULL DEFAULT 'This device',
  device_kind TEXT NOT NULL DEFAULT 'platform',
  backed_up BOOLEAN NOT NULL DEFAULT false,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX user_passkeys_user_idx ON public.user_passkeys(user_id);
GRANT SELECT, UPDATE, DELETE ON public.user_passkeys TO authenticated;
GRANT ALL ON public.user_passkeys TO service_role;
ALTER TABLE public.user_passkeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "passkeys_select_own" ON public.user_passkeys FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "passkeys_update_own" ON public.user_passkeys FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "passkeys_delete_own" ON public.user_passkeys FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.auth_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_key TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT 'Unnamed device',
  platform TEXT,
  approx_location TEXT,
  trusted BOOLEAN NOT NULL DEFAULT true,
  revoked_at TIMESTAMPTZ,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, device_key)
);
CREATE INDEX auth_devices_user_idx ON public.auth_devices(user_id, last_seen_at DESC);
GRANT SELECT, UPDATE, DELETE ON public.auth_devices TO authenticated;
GRANT ALL ON public.auth_devices TO service_role;
ALTER TABLE public.auth_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "devices_select_own" ON public.auth_devices FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "devices_update_own" ON public.auth_devices FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "devices_delete_own" ON public.auth_devices FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.sensitive_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  method TEXT NOT NULL,
  succeeded BOOLEAN NOT NULL,
  device_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX sensitive_verifications_user_idx ON public.sensitive_verifications(user_id, created_at DESC);
GRANT SELECT ON public.sensitive_verifications TO authenticated;
GRANT ALL ON public.sensitive_verifications TO service_role;
ALTER TABLE public.sensitive_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "verifications_select_own" ON public.sensitive_verifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
