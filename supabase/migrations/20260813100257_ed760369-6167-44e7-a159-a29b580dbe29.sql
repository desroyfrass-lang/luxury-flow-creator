CREATE TABLE public.release_approvals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  decision text not null check (decision in ('approved','delayed','changes_requested')),
  summary jsonb not null default '{}'::jsonb,
  note text not null default '',
  outstanding text[] not null default '{}',
  audit_id uuid references public.platform_audits(id) on delete set null,
  invitation_verdict text,
  created_at timestamptz not null default now()
);

GRANT SELECT, INSERT ON public.release_approvals TO authenticated;
GRANT ALL ON public.release_approvals TO service_role;

ALTER TABLE public.release_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders read release approvals"
ON public.release_approvals FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Founders record release approvals"
ON public.release_approvals FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') AND user_id = auth.uid());

CREATE INDEX release_approvals_created_idx ON public.release_approvals (created_at DESC);