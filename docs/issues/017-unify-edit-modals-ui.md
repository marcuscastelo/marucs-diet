# Issue: Unify or Consolidate Edit Modals/Views in UI Sections

**Priority:** Relevant — Useful for codebase consistency and maintainability, but not essential now.

**Area:** UI/Sections Layer (edit modals/views: meal, recipe, item-group)

## Background
The audit ([audit_sections.md](../audit_sections.md)) found that edit modals/views (e.g., meal, recipe, item-group) have highly similar logic, leading to duplication and maintenance overhead.

## Task
- Review edit modals/views for meal, recipe, and item-group.
- Unify or consolidate logic where possible.
- Update or remove related tests as necessary.

## Acceptance Criteria
- Edit modals/views are unified or consolidated where logic is similar.
- All changes are covered by updated or new tests.
- All checks pass (`npm run check`).

## References
- [audit_sections.md](../audit_sections.md)
- [ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)

---
_Small, incremental step. Should not exceed 1K lines of change._
