// ─────────────────────────────────────────────────────────────────────────────
// FV Studios — one canonical production identity (commissioning pass 1).
//
// Two tables grew up separately: studio_projects (the /studio desk) and
// studio_productions (the richer Production Engine: briefs, scripts, scenes,
// characters, masters, distribution). studio_productions is the canonical
// identity, because the whole production chain already hangs off it.
//
// studio_projects is preserved and keeps working. It gains one bridge column,
// production_id, pointing at its canonical production. Code is migration-safe:
// a project with no bridge yet is a legacy shell and says so.
// ─────────────────────────────────────────────────────────────────────────────

export const CANONICAL_PRODUCTION_TABLE = "studio_productions" as const;

export type ProjectShell = {
  id: string;
  title: string;
  production_id?: string | null;
};

export type ProductionRef =
  | { kind: "canonical"; table: typeof CANONICAL_PRODUCTION_TABLE; productionId: string; projectId: string }
  | { kind: "legacy_project"; table: "studio_projects"; projectId: string; note: string };

/** Where does the real identity of this piece of work live? */
export function productionRef(project: ProjectShell): ProductionRef {
  const linked = (project.production_id ?? "").trim();
  if (linked) {
    return {
      kind: "canonical",
      table: CANONICAL_PRODUCTION_TABLE,
      productionId: linked,
      projectId: project.id,
    };
  }
  return {
    kind: "legacy_project",
    table: "studio_projects",
    projectId: project.id,
    note: "This production has not been linked to the canonical production record yet. It still opens and edits normally.",
  };
}

export function needsCanonicalBridge(project: ProjectShell): boolean {
  return productionRef(project).kind === "legacy_project";
}

/** The fields a bridge creates on the canonical side. Deliberately minimal. */
export function bridgePayload(project: ProjectShell, userId: string) {
  return {
    title: project.title?.trim() || "Untitled production",
    production_type: "studio",
    status: "development",
    created_by: userId,
  };
}
