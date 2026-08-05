UPDATE public.builder_memory
SET category = 'platform:' || category
WHERE source = 'onboarding'
  AND category IN ('platform_identity','commerce','builder_experience','platform_ops','launch')
  AND category NOT LIKE 'platform:%';