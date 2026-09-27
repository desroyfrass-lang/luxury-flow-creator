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
  // Step 6 — independent verifier. Grants nothing by itself; access comes only
  // from explicit rows in tester_commissions.
  "tester",
] as const;

export type AppRole = (typeof ROLE_OPTIONS)[number];

/** Experiences a Founder may commission for a Tester. Anything not listed is never testable. */
export const TESTER_EXPERIENCES = [
  "signup_login",
  "welcome_hall",
  "onboarding",
  "daily",
  "workshop",
  "own_data",
] as const;

export type TesterExperience = (typeof TESTER_EXPERIENCES)[number];
