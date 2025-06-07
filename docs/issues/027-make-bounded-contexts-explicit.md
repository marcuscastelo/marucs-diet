# Issue: Make Bounded Contexts Explicit and Avoid Generic Technical Abstractions

**Priority:** Important — Deserves attention for clarity and modularity, but can be scheduled.

**Area:** Cross-Cutting Concerns & DDD Pitfalls

## Background
The audit ([ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)) recommends making bounded contexts explicit and avoiding generic technical abstractions that obscure domain meaning.

## Task
- Review all modules for explicit bounded contexts.
- Refactor to clarify boundaries and avoid generic abstractions.
- Document changes and rationale.

## Acceptance Criteria
- All bounded contexts are explicit and well-documented.
- No generic technical abstractions obscure domain meaning.
- All checks pass (`npm run check`).

## References
- [ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)

---
_Small, incremental step. Should not exceed 1K lines of change._
