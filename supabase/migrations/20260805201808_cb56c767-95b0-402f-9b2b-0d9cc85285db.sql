CREATE TABLE public.page_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text NOT NULL,
  page_title text,
  helpful boolean,
  issue_text text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.page_feedback TO anon;
GRANT INSERT, SELECT ON public.page_feedback TO authenticated;
GRANT ALL ON public.page_feedback TO service_role;

ALTER TABLE public.page_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit page feedback" ON public.page_feedback
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own feedback" ON public.page_feedback
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all feedback" ON public.page_feedback
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));