-- daily_layout_presets: owner identity never leaves the owner
REVOKE SELECT (owner_id) ON public.daily_layout_presets FROM anon, authenticated;
REVOKE SELECT ON public.daily_layout_presets FROM anon;

-- founding_partners: internal identifiers stay away from anonymous visitors
REVOKE SELECT (user_id, invited_by) ON public.founding_partners FROM anon;
REVOKE SELECT ON public.founding_partners FROM anon;
GRANT SELECT (id, sequence, invited_at, accepted_at, visibility, show_on_card, story_why, story_hoped, story_journey, story_lessons, story_public, created_at, updated_at) ON public.founding_partners TO anon;

-- live_broadcasts: host account id is member-only
REVOKE SELECT ON public.live_broadcasts FROM anon;
GRANT SELECT (id, host_name, destination, purpose, title, summary, status, viewer_count, cover_url, product_links, scheduled_for, started_at, ended_at, replay_url, repurposed_as, created_at, updated_at) ON public.live_broadcasts TO anon;

-- live_comments: author account id and handle are member-only
REVOKE SELECT ON public.live_comments FROM anon;
GRANT SELECT (id, broadcast_id, author_name, body, created_at) ON public.live_comments TO anon;

-- live_gifts: sender identity and all money values are member-only
REVOKE SELECT ON public.live_gifts FROM anon;
GRANT SELECT (id, broadcast_id, sender_name, gift_key, created_at) ON public.live_gifts TO anon;