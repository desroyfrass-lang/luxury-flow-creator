-- Additive only: private cache of read-only CJ product detail for queue records.
-- Original cj_data snapshot is never modified. Existing admin-only policy covers these columns.
ALTER TABLE public.cj_import_queue
  ADD COLUMN IF NOT EXISTS cj_detail jsonb,
  ADD COLUMN IF NOT EXISTS cj_detail_fetched_at timestamptz,
  ADD COLUMN IF NOT EXISTS cj_detail_error text;