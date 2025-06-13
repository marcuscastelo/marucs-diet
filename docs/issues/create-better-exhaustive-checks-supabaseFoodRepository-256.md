# Refactor Template

**Title:**
Create a reusable exhaustive check function in supabaseFoodRepository

**Description:**
Refactor the food repository to implement a robust, reusable function for exhaustive checks. Update all relevant usages to use this function, and ensure it is shared across modules if beneficial. Update all affected documentation and tests.

**Scope:**
- src/modules/diet/food/infrastructure/supabaseFoodRepository.ts
- All files and modules performing exhaustive checks in the food repository
- Related documentation and tests

**Motivation:**
A reusable exhaustive check function ensures all cases are handled explicitly, reducing bugs and improving maintainability. Centralizing this logic also makes it easier to update and test.

**Acceptance Criteria:**
- [ ] A reusable exhaustive check function is implemented in the food repository
- [ ] All relevant usages are updated to use the new function
- [ ] All affected documentation and tests are updated

**Additional Context:**
- Consider sharing the function across modules if useful
- See `docs/audit_domain_diet_food.md` for related architectural notes

**Labels:**
- refactor
- complexity-medium
- backend
- improvement

**reportedBy:** github-copilot.v1
