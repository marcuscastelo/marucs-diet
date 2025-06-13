# Refactor Template

**Title:**
Remove nullability from insertDayDiet return type

**Description:**
Refactor the `insertDayDiet` function so that it never returns `null`. Instead, ensure it always returns a valid result or throws a domain error. Update all usages and tests to reflect this change, and document the new behavior.

**Scope:**
- src/modules/diet/day-diet/domain/dayDietRepository.ts
- All modules and files that use `insertDayDiet`
- Related tests and documentation

**Motivation:**
Removing nullability from the return type improves type safety, predictability, and reduces the risk of runtime errors. It also clarifies the contract for consumers of the API.

**Acceptance Criteria:**
- [ ] `insertDayDiet` never returns null
- [ ] All usages are updated to handle the new return type
- [ ] All affected tests and documentation are updated

**Additional Context:**
- Review all usages of `insertDayDiet` in the codebase
- See `docs/audit_domain_diet_day-diet.md` for related notes

**Labels:**
- refactor
- backend
- complexity-medium
- improvement

**reportedBy:** github-copilot.v1
