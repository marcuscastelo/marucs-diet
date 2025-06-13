# Refactor Template

**Title:**
Use dateUtils in TargetDayPicker for consistent date handling

**Description:**
Refactor the `TargetDayPicker` component to utilize the shared `dateUtils` module for all date handling logic. Replace any custom or ad-hoc date logic with calls to `dateUtils`, and update all usages, types, and documentation to ensure consistency and maintainability. Test all affected features for regressions.

**Scope:**
- src/sections/common/components/TargetDayPicker.tsx
- All files and modules referencing date logic in TargetDayPicker
- Related documentation and tests

**Motivation:**
Centralizing date handling logic in a shared utility improves code consistency, reduces duplication, and makes future changes easier. It also ensures that all date logic is tested and maintained in a single place.

**Acceptance Criteria:**
- [ ] All date handling in `TargetDayPicker` uses `dateUtils`
- [ ] All usages, types, and documentation are updated
- [ ] All affected tests are updated

**Additional Context:**
- Test all affected features for regressions
- See `docs/audit_sections_common.md` for related notes

**Labels:**
- refactor
- improvement
- complexity-low
- ui

**reportedBy:** github-copilot.v1
