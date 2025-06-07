# Issue: Use Value Objects Instead of Entities Where Identity Is Not Essential

**Priority:** Important — Deserves attention for domain purity and model correctness, but can be scheduled.

**Area:** Cross-Cutting Concerns & DDD Pitfalls

## Background
The audit ([ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)) recommends using value objects instead of entities where identity is not essential, to improve domain purity and prevent misuse.

## Task
- Review all entities and identify where value objects should be used instead.
- Refactor as needed.
- Update or remove related tests as necessary.

## Acceptance Criteria
- All identity-less concepts use value objects instead of entities.
- All changes are covered by updated or new tests.
- All checks pass (`npm run check`).

## References
- [ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)

---
_Small, incremental step. Should not exceed 1K lines of change._
