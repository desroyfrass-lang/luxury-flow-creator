import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const src = readFileSync("src/lib/roles.functions.ts", "utf8");
const grantRevoke = src.slice(src.indexOf("async function setRole"));

describe("Roles & Access server paths", () => {
  it("grant and revoke go through the database role function", () => {
    expect(grantRevoke).toContain('rpc("founder_set_role"');
  });
  it("grant and revoke never write roles with full database rights", () => {
    expect(grantRevoke).not.toContain("supabaseAdmin");
    expect(grantRevoke).not.toMatch(/from\("user_roles"\)/);
  });
});
