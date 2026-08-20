REVOKE SELECT (author_id, subject_id) ON public.verified_feedback FROM authenticated;
REVOKE SELECT (proposed_by, approved_by) ON public.for_us_stories FROM authenticated;