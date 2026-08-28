// FRASS-0591 — One account menu, one source of truth.
//
// The profile menu used to be a flat list repeated in two places (desktop
// dropdown and mobile sheet), with Founder-only doors sitting beside everyday
// member doors. This module describes the menu once, grouped by what a person
// is actually doing, and hides anything their role does not open.

import type { AppRole } from "@/lib/roles";

export type AccountMenuItem = {
  /** Internal path — members never see it. */
  to: string;
  label: string;
  glyph: string;
  /** Plain-English hint, shown as a tooltip. */
  plain?: string;
};

export type AccountMenuGroup = {
  id: string;
  label: string;
  items: AccountMenuItem[];
};

const FOUNDER_ROLES: AppRole[] = ["super_admin", "admin"];
const OPERATOR_ROLES: AppRole[] = ["staff", "moderator"];

/**
 * Builds the menu for one person. Nothing here is decorative: if a door is
 * listed, that person can walk through it.
 */
export function accountMenuGroups(roles: AppRole[]): AccountMenuGroup[] {
  const has = (list: AppRole[]) => list.some((r) => roles.includes(r));
  const isFounder = has(FOUNDER_ROLES);
  const isOperator = has(OPERATOR_ROLES);

  const groups: AccountMenuGroup[] = [
    {
      id: "your-day",
      label: "Your day",
      items: [
        { to: "/room", label: "My Workspace", glyph: "🗂", plain: "Where today's work lives." },
        { to: "/welcome-hall", label: "Welcome Hall", glyph: "✨", plain: "The front door of Frass." },
        { to: "/workspace/card", label: "My Frass Card", glyph: "🪪", plain: "Your identity in Frass." },
      ],
    },
    {
      id: "build",
      label: "Build",
      items: [
        { to: "/vault", label: "Builder Vault", glyph: "🔐", plain: "Everything you own and keep." },
        { to: "/money-moves", label: "Money Moves", glyph: "💷", plain: "The next earning step." },
        { to: "/creation", label: "Creation District", glyph: "🎨", plain: "Design and make things." },
        { to: "/studio", label: "FV Studios", glyph: "🎬", plain: "Film, edit and publish." },
        { to: "/opportunity", label: "Opportunity Center", glyph: "🧭", plain: "Where new work comes from." },
        { to: "/academy", label: "Academy", glyph: "🎓", plain: "Learn the skill you need next." },
      ],
    },
  ];

  if (isOperator && !isFounder) {
    groups.push({
      id: "operations",
      label: "Operations",
      items: [
        { to: "/admin/approvals", label: "Approvals", glyph: "✅", plain: "Review what is waiting." },
      ],
    });
  }

  if (isFounder) {
    groups.push({
      id: "founder-hall",
      label: "Founder Hall",
      items: [
        { to: "/control-room", label: "Founder Control Room", glyph: "🏛", plain: "Command of the whole platform." },
        { to: "/studios", label: "Frassy Studios", glyph: "🎞", plain: "The production house." },
        { to: "/admin", label: "Site Management", glyph: "🛠", plain: "Everyday admin tools." },
        { to: "/admin/roles", label: "Roles & Access", glyph: "🗝", plain: "Who may open what." },
      ],
    });
  }

  return groups;
}
