# Issue: Clarify and Document Bounded Contexts; Split Large Modules if Needed

**Priority:** Important — Deserves attention for clarity and modularity, but can be scheduled.

**Area:** Domain Layer (all modules)

## Background
The audit ([audit_domain.md](../audit_domain.md)) notes that some modules may be too large or unclear in their boundaries. DDD recommends explicit bounded contexts to avoid coupling and maintain clarity.

## Task
- Review all domain modules for bounded context clarity.
- Document explicit bounded contexts in code and Markdown.
- Split large modules into smaller, focused modules if needed.
- Update or remove related tests as necessary.

## Acceptance Criteria
- All bounded contexts are documented and clear.
- Large modules are split where appropriate.
- JSDoc for all affected exported types/functions is updated.
- All checks pass (`npm run check`).

## References
- [audit_domain.md](../audit_domain.md)
- [ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)

---
_Small, incremental step. Should not exceed 1K lines of change._
