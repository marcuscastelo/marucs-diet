# Refactor Template

**Title:**
Move function in MealEditView to a more appropriate module

**Description:**
Refactor the specified function in `MealEditView` by moving it to a more appropriate location or module, such as a shared utility, hook, or the application layer. Update all usages, types, and documentation to reflect this change. Ensure that the function is properly tested in its new location.

**Scope:**
- src/sections/meal/components/MealEditView.tsx
- All files and modules referencing the moved function
- Related documentation and tests

**Motivation:**
Moving functions to more appropriate modules improves code organization, maintainability, and reusability. It also aligns with clean architecture principles.

**Acceptance Criteria:**
- [ ] Function is moved to a more appropriate location
- [ ] All usages, types, and documentation are updated
- [ ] All affected tests are updated

**Additional Context:**
- Review all usages of the function in the codebase
- See `docs/audit_sections_meal.md` for related architectural notes

**Labels:**
- refactor
- complexity-low
- ui
- improvement

**reportedBy:** github-copilot.v1
