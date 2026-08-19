
-- for_us_stories: hide proposed_by / approved_by from anonymous readers
REVOKE SELECT ON public.for_us_stories FROM anon;
GRANT SELECT (id, section_id, series, source_label, title, summary, body, categories, tags,
  media_url, media_kind, cta_label, cta_to, impact_note, revenue_note, audience, status,
  origin, occurred_at, published_at, created_at, updated_at)
  ON public.for_us_stories TO anon;

-- learning_activities: hide created_by / reviewed_by from anonymous readers
REVOKE SELECT ON public.learning_activities FROM anon;
GRANT SELECT (id, slug, title, district, age_group, place_slug, category, difficulty,
  duration_minutes, learning_objective, description, hero_image, thumbnail, video_url,
  audio_url, story, instructions, materials, parent_guide, teacher_guide,
  discussion_questions, reflection_questions, worksheets, coloring_pages, downloads,
  slides, quiz, badge, skills, follow_up_slugs, related_slugs, seasonal_tags, themes,
  extras, status, version, position, featured, published_at, reviewed_at, created_at, updated_at)
  ON public.learning_activities TO anon;

-- verified_feedback: hide author_id / subject_id from anonymous readers
REVOKE SELECT ON public.verified_feedback FROM anon;
GRANT SELECT (id, source, source_id, experience, body, is_published, removed_by_founder,
  created_at, updated_at)
  ON public.verified_feedback TO anon;
