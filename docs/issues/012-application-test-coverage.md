# Issue: Review Application-Level Test Coverage and Integration Points

**Priority:** Very Important — High priority for integration and orchestration reliability, but can wait a short time.

**Area:** Application Layer (all modules)

## Background
The audit ([audit_application.md](../audit_application.md)) recommends reviewing and improving test coverage for the application layer, especially for integration points and orchestration logic.

## Task
- Review current test coverage for the application layer.
- Add or update tests for integration points and orchestration logic.
- Remove obsolete or redundant tests.

## Acceptance Criteria
- Application layer has comprehensive test coverage for integration and orchestration logic.
- All changes are covered by updated or new tests.
- All checks pass (`npm run check`).

## References
- [audit_application.md](../audit_application.md)
- [ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)

---
_Small, incremental step. Should not exceed 1K lines of change._
