# Issue: Standardize and Document Repository Interfaces and Error Types

**Priority:** Urgent — Should be resolved as soon as possible to prevent integration and error handling issues.

**Area:** Domain Layer (all modules)

## Background
The audit ([audit_domain.md](../audit_domain.md)) found inconsistent repository interfaces and error handling across modules. Nullable returns and lack of custom error types make error handling and integration harder, and violate DDD best practices.

## Task
- Standardize repository interfaces for all domain modules (avoid nullable returns; use explicit error types or results).
- Document repository contracts and error types in code and JSDoc.
- Introduce or update custom error classes for domain invariants and business rules.
- Update or remove related tests as necessary.

## Acceptance Criteria
- All repository interfaces are consistent and documented.
- Nullable returns are replaced with explicit error/result types.
- Custom error classes are used for domain errors.
- JSDoc for all affected exported types/functions is updated.
- All checks pass (`npm run check`).

## References
- [audit_domain.md](../audit_domain.md)
- [ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)

---
_Small, incremental step. Should not exceed 1K lines of change._
