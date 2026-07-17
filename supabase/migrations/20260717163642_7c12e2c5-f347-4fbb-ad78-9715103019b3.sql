
CREATE TABLE public.cj_import_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cj_pid TEXT NOT NULL UNIQUE,
  cj_data JSONB NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT,
  source_price NUMERIC,
  suggested_price NUMERIC,
  brand TEXT,
  gender TEXT,
  category TEXT,
  subcategory TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  decided_by UUID REFERENCES auth.users(id),
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX cj_import_queue_status_idx ON public.cj_import_queue(status);
CREATE INDEX cj_import_queue_created_idx ON public.cj_import_queue(created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cj_import_queue TO authenticated;
GRANT ALL ON public.cj_import_queue TO service_role;

ALTER TABLE public.cj_import_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage CJ queue" ON public.cj_import_queue
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER cj_import_queue_updated_at BEFORE UPDATE ON public.cj_import_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
