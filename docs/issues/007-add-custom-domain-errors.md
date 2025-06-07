# Issue: Add Custom Error Classes for Domain Invariants and Business Rules

**Priority:** Important — Deserves attention for clarity and robust error handling, but can be scheduled.

**Area:** Domain Layer (all modules)

## Background
The audit ([audit_domain.md](../audit_domain.md)) found that some domain modules lack custom error classes for invariants and business rules. Using explicit error types improves clarity and error handling across layers.

## Task
- Introduce custom error classes for all domain invariants and business rules.
- Refactor domain code to throw these errors instead of generic errors or strings.
- Update or remove related tests as necessary.

## Acceptance Criteria
- All domain invariants and business rules use custom error classes.
- JSDoc for all affected exported types/functions is updated.
- All checks pass (`npm run check`).

## References
- [audit_domain.md](../audit_domain.md)
- [ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)

---
_Small, incremental step. Should not exceed 1K lines of change._
