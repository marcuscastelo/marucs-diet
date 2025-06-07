# Issue: Move Business Logic Out of UI Components

**Priority:** Critical — Immediate action required for DDD compliance and UI separation.

**Area:** UI/Sections Layer (all sections)

## Background
The audit ([audit_sections.md](../audit_sections.md)) found business logic (validation, calculations, state) in UI components. DDD and clean architecture require business logic to reside in the domain or application layers.

## Task
- Identify business logic in UI components (validation, calculations, state management).
- Move logic to application/domain layers or custom hooks as appropriate.
- Update or remove related tests as necessary.

## Acceptance Criteria
- UI components are free of business logic.
- All changes are covered by updated or new tests.
- All checks pass (`npm run check`).

## References
- [audit_sections.md](../audit_sections.md)
- [ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)

---
_Small, incremental step. Should not exceed 1K lines of change._
