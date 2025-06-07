# Issue: Audit and Refactor Application Error Handling for handleApiError Context

**Priority:** Urgent — Should be resolved as soon as possible for traceability and user feedback.

**Area:** Application Layer (all modules)

## Background
The audit ([audit_application.md](../audit_application.md)) found that some application code does not provide sufficient context to `handleApiError`, or omits it entirely. DDD and clean architecture require that all errors in the application layer are handled with full context for traceability and user feedback.

## Task
- Audit all application code for missing or insufficient `handleApiError` context.
- Refactor to ensure every error path provides full context to `handleApiError`.
- Update or remove related tests as necessary.

## Acceptance Criteria
- All application error handling uses `handleApiError` with appropriate context.
- JSDoc for all affected exported types/functions is updated.
- All checks pass (`npm run check`).

## References
- [audit_application.md](../audit_application.md)
- [ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)

---
_Small, incremental step. Should not exceed 1K lines of change._
