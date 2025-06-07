# Issue: Refactor Duplicated Logic in UI/Sections into Shared Hooks/Utilities

**Priority:** Important — Deserves attention for maintainability and consistency, but can be scheduled.

**Area:** UI/Sections Layer (all sections)

## Background
The audit ([audit_sections.md](../audit_sections.md)) found duplicated logic (clipboard, schema, calculations, macro/weight/profile logic) across UI sections. This increases maintenance cost and risk of inconsistencies.

## Task
- Identify duplicated logic in UI/sections (clipboard, schema, calculations, macro/weight/profile logic).
- Refactor into shared hooks or utilities.
- Update or remove related tests as necessary.

## Acceptance Criteria
- Duplicated logic is refactored into shared hooks/utilities.
- All changes are covered by updated or new tests.
- All checks pass (`npm run check`).

## References
- [audit_sections.md](../audit_sections.md)
- [ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)

---
_Small, incremental step. Should not exceed 1K lines of change._
