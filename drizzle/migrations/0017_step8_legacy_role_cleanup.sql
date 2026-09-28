-- Step 8: remove unexplained legacy staff powers on Founder-only tools; Founder = admin OR super_admin.
DROP POLICY IF EXISTS "Staff can update activities" ON public.learning_activities;
CREATE POLICY "Staff can update activities" ON public.learning_activities FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
DROP POLICY IF EXISTS "Staff can insert activities" ON public.learning_activities;
CREATE POLICY "Staff can insert activities" ON public.learning_activities FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
DROP POLICY IF EXISTS "Staff can read all activities" ON public.learning_activities;
CREATE POLICY "Staff can read all activities" ON public.learning_activities FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
DROP POLICY IF EXISTS "Staff can write versions" ON public.learning_activity_versions;
CREATE POLICY "Staff can write versions" ON public.learning_activity_versions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
DROP POLICY IF EXISTS "Staff can read versions" ON public.learning_activity_versions;
CREATE POLICY "Staff can read versions" ON public.learning_activity_versions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
DROP POLICY IF EXISTS "Staff read repair patterns" ON public.repair_patterns;
CREATE POLICY "Staff read repair patterns" ON public.repair_patterns FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.page_feedback;
CREATE POLICY "Admins can view all feedback" ON public.page_feedback FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'super_admin'));