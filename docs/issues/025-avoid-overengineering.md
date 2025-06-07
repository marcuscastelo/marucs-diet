# Issue: Avoid Overengineering (CQRS, Event Sourcing, Hexagonal) Unless Justified

**Priority:** Important — Deserves attention to prevent unnecessary complexity, but can be scheduled.

**Area:** Cross-Cutting Concerns & DDD Pitfalls

## Background
The audit ([ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)) warns against overengineering with advanced patterns unless justified by real complexity.

## Task
- Review current and planned architecture for unnecessary complexity (CQRS, event sourcing, hexagonal, etc.).
- Document where such patterns are used and whether they are justified.
- Propose simplifications where possible.

## Acceptance Criteria
- No unjustified advanced patterns remain in the codebase.
- All uses of advanced patterns are documented and justified.
- All checks pass (`npm run check`).

## References
- [ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)

---
_Small, incremental step. Should not exceed 1K lines of change._
