# Issue: Ensure All Business Rules and Invariants Are Encapsulated in Domain Entities/Value Objects

**Priority:** Critical — Immediate action required for DDD compliance and business rule safety.

**Area:** Cross-Cutting Concerns & DDD Pitfalls

## Background
The audit ([ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)) recommends ensuring all business rules and invariants are encapsulated in domain entities or value objects, not in services or application code.

## Task
- Review all business rules and invariants in the codebase.
- Refactor to ensure they are encapsulated in domain entities or value objects.
- Update or remove related tests as necessary.

## Acceptance Criteria
- All business rules and invariants are encapsulated in domain entities/value objects.
- All changes are covered by updated or new tests.
- All checks pass (`npm run check`).

## References
- [ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)

---
_Small, incremental step. Should not exceed 1K lines of change._
