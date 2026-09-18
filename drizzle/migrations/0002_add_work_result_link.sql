ALTER TABLE public.member_actions
  ADD COLUMN IF NOT EXISTS result_kind text,
  ADD COLUMN IF NOT EXISTS result_ref text,
  ADD COLUMN IF NOT EXISTS result_label text,
  ADD COLUMN IF NOT EXISTS result_at timestamptz;

ALTER TABLE public.member_actions
  ADD CONSTRAINT member_actions_result_kind_check
  CHECK (result_kind IS NULL OR result_kind IN ('card-listing','hidden-asset','gallery-artwork','studio-production'));

CREATE INDEX IF NOT EXISTS member_actions_result_idx
  ON public.member_actions (owner_id, result_kind, result_at DESC);