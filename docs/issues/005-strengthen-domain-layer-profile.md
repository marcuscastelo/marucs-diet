# Issue: Introduce or Strengthen Domain Layers in Weak Modules

**Priority:** Urgent — Should be resolved soon to prevent business logic leakage.

**Area:** Domain Layer (e.g., profile)

## Background
The audit ([audit_domain_profile.md](../audit_domain_profile.md)) found that some modules (e.g., profile) lack a true domain layer, with business logic leaking into application or UI code. DDD requires a clear domain layer for encapsulating business rules and invariants.

## Task
- Identify modules lacking a domain layer (e.g., profile).
- Introduce or strengthen the domain layer, moving business logic from application/UI to domain entities/value objects.
- Update or remove related tests as necessary.

## Acceptance Criteria
- All modules have a clear, encapsulated domain layer.
- Business logic is not present in application or UI code.
- JSDoc for all affected exported types/functions is updated.
- All checks pass (`npm run check`).

## References
- [audit_domain_profile.md](../audit_domain_profile.md)
- [ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)

---
_Small, incremental step. Should not exceed 1K lines of change._
