# Issue: Review and Improve Domain Test Coverage

**Priority:** Very Important — High priority for regression prevention and domain safety, but can wait a short time.

**Area:** Domain Layer (all modules)

## Background
The audit ([audit_domain.md](../audit_domain.md)) recommends improving test coverage for domain logic, especially for invariants and edge cases. This ensures domain rules are enforced and regressions are caught early.

## Task
- Review current test coverage for all domain modules.
- Add or update tests to cover invariants, edge cases, and business rules.
- Remove obsolete or redundant tests.

## Acceptance Criteria
- All domain modules have comprehensive test coverage for invariants and edge cases.
- All changes are covered by updated or new tests.
- All checks pass (`npm run check`).

## References
- [audit_domain.md](../audit_domain.md)
- [ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)

---
_Small, incremental step. Should not exceed 1K lines of change._
