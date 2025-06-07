# Issue: Expand Audit to Async Flows, Side Effects, and Error Propagation

**Priority:** Important — Deserves attention for robust async and error handling, but can be scheduled.

**Area:** Application Layer (all modules)

## Background
The audit ([audit_application.md](../audit_application.md)) recommends expanding the audit to cover async flows, side effects, and error propagation, which are critical for robust application logic.

## Task
- Review all async flows and side effects in the application layer.
- Audit and document error propagation paths.
- Propose improvements or refactors as needed.
- Update or remove related tests as necessary.

## Acceptance Criteria
- All async flows and side effects are documented and tested.
- Error propagation is clear and robust.
- All checks pass (`npm run check`).

## References
- [audit_application.md](../audit_application.md)
- [ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)

---
_Small, incremental step. Should not exceed 1K lines of change._
