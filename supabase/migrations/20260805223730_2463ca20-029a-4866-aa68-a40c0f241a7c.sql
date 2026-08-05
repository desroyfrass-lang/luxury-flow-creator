UPDATE public.builder_journeys AS journey
SET current_stage = 'op_brand_name',
    status = 'in_progress',
    completed_at = NULL,
    last_active_at = now()
WHERE EXISTS (
  SELECT 1
  FROM public.user_roles AS role
  WHERE role.user_id = journey.user_id
    AND role.role = 'admin'
)
AND journey.current_stage NOT LIKE 'op\_%' ESCAPE '\';