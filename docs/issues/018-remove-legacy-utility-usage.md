# Issue: Remove Legacy Utility Usage from Domain/Application Code

**Priority:** Urgent — Should be resolved soon for DDD compliance and technical debt reduction.

**Area:** Shared & Legacy

## Background
The audit ([audit_shared_legacy.md](../audit_shared_legacy.md)) found that legacy utilities (e.g., `idUtils`, `macroMath`, `deepCopy`) are still used in domain and application code, violating DDD boundaries.

## Task
- Identify all legacy utility usage in domain/application code.
- Refactor to remove or replace with value objects or pure functions.
- Update or remove related tests as necessary.

## Acceptance Criteria
- No legacy utility usage remains in domain/application code.
- All changes are covered by updated or new tests.
- All checks pass (`npm run check`).

## References
- [audit_shared_legacy.md](../audit_shared_legacy.md)
- [ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)

---
_Small, incremental step. Should not exceed 1K lines of change._
