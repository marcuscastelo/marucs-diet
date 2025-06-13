# Refactor Template

**Title:**
Rename `macros` property to `foodMacros` in recipe item domain

**Description:**
Rename the `macros` property to `foodMacros` in the recipe item domain for improved clarity and consistency. Update all usages, related types, and documentation to reflect this change.

**Scope:**
- src/modules/diet/recipe-item/domain/recipeItem.ts
- All files and modules referencing the `macros` property in recipe items
- Related documentation and tests

**Motivation:**
Clear and unambiguous property names reduce confusion and improve maintainability. This change ensures that the property name accurately reflects its purpose and content.

**Acceptance Criteria:**
- [ ] `macros` property is renamed to `foodMacros` everywhere
- [ ] All usages, types, and documentation are updated
- [ ] All affected tests are updated

**Additional Context:**
- See `docs/audit_domain_diet_recipe-item.md` for related notes

**Labels:**
- refactor
- complexity-low
- backend
- improvement

**reportedBy:** github-copilot.v1
