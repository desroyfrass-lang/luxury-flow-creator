export const ROLE_OPTIONS = [
  "admin",
  "super_admin",
  "staff",
  "moderator",
  "designer",
  "affiliate",
  "partner",
  "ambassador",
  "customer",
] as const;

export type AppRole = (typeof ROLE_OPTIONS)[number];
