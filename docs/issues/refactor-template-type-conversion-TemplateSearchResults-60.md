# Refactor Template

**Title:**
Refactor conversion from template type to group/item types in TemplateSearchResults

**Description:**
Refactor the conversion logic from template type to group/item types in `TemplateSearchResults` for improved clarity, maintainability, and testability. Centralize the logic in a utility or hook and update all usages, types, and documentation accordingly.

**Scope:**
- src/sections/search/components/TemplateSearchResults.tsx
- All files and modules referencing the conversion logic
- Related documentation and tests

**Motivation:**
Centralizing and clarifying conversion logic reduces duplication, improves maintainability, and makes the codebase easier to understand and test.

**Acceptance Criteria:**
- [ ] Conversion logic is refactored for clarity and maintainability
- [ ] Logic is centralized in a utility or hook
- [ ] All usages, types, and documentation are updated
- [ ] All affected tests are updated

**Additional Context:**
- Review all usages of the conversion logic in the codebase
- See `docs/audit_sections_search.md` for related architectural notes

**Labels:**
- refactor
- complexity-medium
- ui
- backend
- improvement

**reportedBy:** github-copilot.v1
