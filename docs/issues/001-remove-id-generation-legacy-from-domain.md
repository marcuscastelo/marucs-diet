# Issue: Remove ID Generation and Legacy Utility Usage from Domain Code

**Priority:** Critical — Immediate action required. DDD violation and risk of domain impurity.

**Area:** Domain Layer (see diet submodules, especially meal, item, item-group)

## Background
Audit findings in [audit_domain.md](../audit_domain.md) and [audit_domain_diet.md](../audit_domain_diet.md) highlight that ID generation and legacy utility functions (e.g., `idUtils`, `macroMath`, `deepCopy`) are still present in domain code. This violates DDD principles, as domain logic should be pure and free of side effects or infrastructure concerns.

## Task
- Refactor all ID generation and legacy utility usage out of domain code in the following diet submodules:
  - meal
  - item
  - item-group
- Move ID generation to the application layer or appropriate factories.
- Replace legacy utility calls with value objects or pure functions as needed.
- Ensure domain entities and value objects remain pure and side-effect free.
- Update or remove related tests as necessary.

## Acceptance Criteria
- No ID generation or legacy utility usage remains in any domain code for the specified submodules.
- All changes are covered by updated or new tests.
- JSDoc for all affected exported types/functions is updated.
- All checks pass (`npm run check`).

## References
- [audit_domain.md](../audit_domain.md)
- [audit_domain_diet.md](../audit_domain_diet.md)
- [ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)

---
_Small, incremental step. Should not exceed 1K lines of change._
