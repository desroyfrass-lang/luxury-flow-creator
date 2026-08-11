CREATE TABLE public.partner_launch_state (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  mission text,
  hours_per_day numeric NOT NULL DEFAULT 2,
  income_goal numeric NOT NULL DEFAULT 0,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.partner_launch_state TO authenticated;
GRANT ALL ON public.partner_launch_state TO service_role;

ALTER TABLE public.partner_launch_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own launch state readable"
  ON public.partner_launch_state FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "own launch state insert"
  ON public.partner_launch_state FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own launch state update"
  ON public.partner_launch_state FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER partner_launch_state_updated_at
  BEFORE UPDATE ON public.partner_launch_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();