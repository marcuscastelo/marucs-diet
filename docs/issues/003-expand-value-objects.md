# Issue: Expand Use of Value Objects for Identity-less Concepts

**Priority:** Very Important — High priority for domain purity and future-proofing, but can wait a short time.

**Area:** Domain Layer (all modules)

## Background
The audit ([audit_domain.md](../audit_domain.md)) recommends using value objects for concepts that do not require identity (e.g., measurements, macro targets). This improves domain purity and prevents accidental misuse of primitives.

## Task
- Identify all identity-less concepts in the domain (e.g., measurements, macro targets).
- Refactor to use value objects instead of primitives or loose types.
- Update or remove related tests as necessary.

## Acceptance Criteria
- All identity-less concepts are represented as value objects.
- JSDoc for all affected exported types/functions is updated.
- All checks pass (`npm run check`).

## References
- [audit_domain.md](../audit_domain.md)
- [ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)

---
_Small, incremental step. Should not exceed 1K lines of change._
