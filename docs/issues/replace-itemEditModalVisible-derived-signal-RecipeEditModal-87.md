# Refactor Template

**Title:**
Replace itemEditModalVisible with a derived signal in RecipeEditModal

**Description:**
Refactor the `RecipeEditModal` component to use a derived signal for modal visibility instead of the `itemEditModalVisible` state. Update all usages, related modals, and contexts to use the new approach. Review and update tests and documentation as needed.

**Scope:**
- src/sections/recipe/components/RecipeEditModal.tsx
- All files and modules referencing `itemEditModalVisible`
- Related modals, contexts, and tests

**Motivation:**
Using a derived signal for modal visibility improves state management, reduces boilerplate, and enhances code clarity. This change aligns with best practices for state management in modern UI frameworks.

**Acceptance Criteria:**
- [ ] `RecipeEditModal` uses a derived signal for modal visibility
- [ ] All usages and related contexts are updated
- [ ] All affected tests and documentation are reviewed and updated

**Additional Context:**
- See `docs/audit_sections_recipe.md` for related notes

**Labels:**
- refactor
- complexity-low
- ui
- improvement

**reportedBy:** github-copilot.v1
