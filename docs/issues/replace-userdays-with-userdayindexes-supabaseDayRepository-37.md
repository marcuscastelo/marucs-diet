# Refactor Template

**Title:**
Replace userDays with userDayIndexes in day-diet infrastructure

**Description:**
Refactor the day-diet infrastructure to replace all usage of `userDays` with `userDayIndexes`. Update all affected modules, types, and documentation to ensure clarity and maintainability.

**Scope:**
- src/modules/diet/day-diet/infrastructure/supabaseDayRepository.ts
- All files and modules referencing `userDays`
- Related documentation and tests

**Motivation:**
Using a more descriptive and accurate identifier like `userDayIndexes` improves code clarity and maintainability, making the codebase easier to understand and evolve.

**Acceptance Criteria:**
- [ ] All references to `userDays` are replaced with `userDayIndexes` where appropriate
- [ ] All affected modules, types, and documentation are updated
- [ ] All affected tests are updated

**Additional Context:**
- Review related documentation and usages for consistency
- See `docs/audit_domain_diet_day-diet.md` for related notes

**Labels:**
- refactor
- backend
- complexity-medium
- improvement

**reportedBy:** github-copilot.v1
