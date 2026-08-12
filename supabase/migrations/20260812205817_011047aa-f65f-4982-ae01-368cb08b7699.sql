CREATE TABLE public.agreement_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  level text not null check (level in ('visitor','builder')),
  version text not null check (char_length(version) between 1 and 32),
  accepted_at timestamptz not null default now(),
  user_agent text check (user_agent is null or char_length(user_agent) <= 400),
  unique (user_id, level, version)
);

GRANT SELECT, INSERT ON public.agreement_acceptances TO authenticated;
GRANT ALL ON public.agreement_acceptances TO service_role;

ALTER TABLE public.agreement_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read their own agreement acceptances"
ON public.agreement_acceptances FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Members record their own agreement acceptances"
ON public.agreement_acceptances FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE INDEX agreement_acceptances_user_idx ON public.agreement_acceptances (user_id, level);