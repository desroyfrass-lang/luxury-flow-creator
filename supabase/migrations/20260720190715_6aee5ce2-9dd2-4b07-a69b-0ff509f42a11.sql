
-- 1) Expand RBAC roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'staff';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'moderator';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'designer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'affiliate';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'partner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ambassador';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'customer';
