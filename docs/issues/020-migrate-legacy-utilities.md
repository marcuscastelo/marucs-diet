# Issue: Propose and Execute Migration Steps for Remaining Legacy Utilities

**Priority:** Important — Deserves attention for legacy migration progress tracking, but can be scheduled.

**Area:** Shared & Legacy

## Background
The audit ([audit_shared_legacy.md](../audit_shared_legacy.md)) recommends proposing and executing migration steps for remaining legacy utilities, and tracking progress in dedicated audit files.

## Task
- Propose migration steps for each remaining legacy utility.
- Track progress in `audit_shared_legacy_<utility>.md` files.
- Execute migration steps incrementally.
- Update or remove related tests as necessary.

## Acceptance Criteria
- Migration steps for all legacy utilities are proposed and tracked.
- Progress is documented in audit files.
- All changes are covered by updated or new tests.
- All checks pass (`npm run check`).

## References
- [audit_shared_legacy.md](../audit_shared_legacy.md)
- [ARCHITECTURE_AUDIT.md](../ARCHITECTURE_AUDIT.md)

---
_Small, incremental step. Should not exceed 1K lines of change._
