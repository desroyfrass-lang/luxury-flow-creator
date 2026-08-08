---
name: One feature, one component, one route
description: Permanent engineering rule — audit for existing implementations before building; never create a second version of a workspace, panel, or composer
type: preference
---
"One feature, one component, one route, one source of truth."

Before building anything in Frass OS:
1. Search the codebase for an existing implementation (routes, components, hooks).
2. Verify current behavior and which version is actually rendered.
3. Extend the existing architecture where possible.
4. Build new only when no suitable implementation exists.

If duplicates exist: merge the strongest implementation, delete obsolete ones, update routing + navigation. Never create a third version.

For large architectural directives, deliver a **Workspace/Architecture Audit Report** (existing implementations, duplicates, active vs legacy, consolidation plan, recommendation ✅ extend / ⚠ consolidate / 🆕 new) BEFORE writing code.

**Why:** duplication creates technical debt, user confusion, and wasted Lovable credits.
