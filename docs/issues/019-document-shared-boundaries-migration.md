# Issue: Clarify Migration Plan and Document Shared Module Boundaries

**Priority:** Important — Deserves attention for migration planning and shared code clarity, but can be scheduled.

**Area:** Shared & Legacy

## Background
The audit ([audit_shared_legacy.md](../audit_shared_legacy.md)) recommends clarifying the migration plan for legacy utilities and documenting boundaries and allowed usage for shared modules.

## Task
- Document shared module boundaries and allowed usage in Markdown and code comments.
- Propose and document a migration plan for remaining legacy utilities.
- Update or remove related tests as necessary.

## Acceptance Criteria
- Shared module boundaries and allowed usage are documented.
- Migration plan for legacy utilities is documented.
- All checks pass (`npm run check`).

## References
- [audit_shared_legacy.md](../audit_shared_legacy.md)
- [ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)

---
_Small, incremental step. Should not exceed 1K lines of change._
