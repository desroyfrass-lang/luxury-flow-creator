REVOKE SELECT ON public.artist_galleries FROM anon;
GRANT SELECT (
  id, user_id, handle, display_name, disciplines, biography, artist_statement,
  hero_url, avatar_url, location, current_exhibition, commission_status,
  commission_note, commission_from_price, currency, theme, accent,
  is_published, created_at, updated_at
) ON public.artist_galleries TO anon;

REVOKE SELECT ON public.founding_partners FROM anon, authenticated;
GRANT SELECT (
  id, user_id, sequence, invited_at, accepted_at, invited_by, visibility,
  show_on_card, story_why, story_hoped, story_journey, story_lessons,
  story_public, created_at, updated_at
) ON public.founding_partners TO anon, authenticated;