# Issue: Audit UI Sections for Business Logic Leakage and Duplication

**Priority:** Important — Deserves attention for systematic improvement, but can be scheduled.

**Area:** UI/Sections Layer (all sections)

## Background
The audit ([audit_sections.md](../audit_sections.md)) recommends a systematic audit of all section components for business logic leakage, legacy utility usage, and code duplication.

## Task
- Audit all section components for business logic leakage, legacy utility usage, and duplication.
- Document findings and propose refactors as needed.

## Acceptance Criteria
- All section components are audited and findings documented.
- Refactor proposals are created for each issue found.
- All checks pass (`npm run check`).

## References
- [audit_sections.md](../audit_sections.md)
- [ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)

---
_Small, incremental step. Should not exceed 1K lines of change._
