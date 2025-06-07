# Issue: Review Cross-Module Dependencies and Domain Events

**Priority:** Important — Deserves attention for architectural health and decoupling, but can be scheduled.

**Area:** Cross-Cutting Concerns & DDD Pitfalls

## Background
The audit ([ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)) recommends reviewing cross-module dependencies and domain events to avoid tight coupling and the "big ball of mud" anti-pattern.

## Task
- Review all cross-module dependencies and domain events.
- Document any tight coupling or anti-patterns found.
- Propose refactors to decouple modules as needed.

## Acceptance Criteria
- Cross-module dependencies and domain events are documented.
- Tight coupling is identified and refactor proposals are created.
- All checks pass (`npm run check`).

## References
- [ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)

---
_Small, incremental step. Should not exceed 1K lines of change._
