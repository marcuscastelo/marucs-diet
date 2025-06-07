# Issue: Refactor Orchestration Logic to Keep Business Rules in Domain

**Priority:** Critical — Immediate action required for DDD compliance and business rule safety.

**Area:** Application Layer (all modules)

## Background
The audit ([audit_application.md](../audit_application.md)) found that some business rules are implemented in the application or UI layers, rather than in the domain. DDD requires business rules and invariants to be encapsulated in the domain layer.

## Task
- Identify and refactor business rules currently implemented in the application or UI layers.
- Move these rules to the domain layer (entities, value objects, or domain services).
- Update or remove related tests as necessary.

## Acceptance Criteria
- All business rules and invariants are enforced in the domain layer.
- JSDoc for all affected exported types/functions is updated.
- All checks pass (`npm run check`).

## References
- [audit_application.md](../audit_application.md)
- [ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)

---
_Small, incremental step. Should not exceed 1K lines of change._
