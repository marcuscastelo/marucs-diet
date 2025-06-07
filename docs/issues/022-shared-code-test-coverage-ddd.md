# Issue: Review Shared Code Test Coverage and DDD Violations

**Priority:** Very Important — High priority for shared code reliability and DDD compliance, but can wait a short time.

**Area:** Shared & Legacy

## Background
The audit ([audit_shared_legacy.md](../audit_shared_legacy.md)) recommends reviewing test coverage for shared code and ensuring no DDD violations remain.

## Task
- Review test coverage for all shared code.
- Add or update tests as needed.
- Audit for DDD violations and refactor as necessary.

## Acceptance Criteria
- Shared code has comprehensive test coverage.
- No DDD violations remain in shared code.
- All changes are covered by updated or new tests.
- All checks pass (`npm run check`).

## References
- [audit_shared_legacy.md](../audit_shared_legacy.md)
- [ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)

---
_Small, incremental step. Should not exceed 1K lines of change._
