# Refactor Template

**Title:**
Rename MacroProfileComp to MacroProfile for consistency

**Description:**
Rename the `MacroProfileComp` component to `MacroProfile` throughout the codebase to maintain naming consistency. Update all imports, usages, and related documentation. Ensure exported JSDoc is updated and all tests are reviewed for accuracy.

**Scope:**
- src/sections/profile/components/MacroProfile.tsx
- All files importing or referencing `MacroProfileComp`
- Related documentation and tests

**Motivation:**
Consistent naming improves code clarity, discoverability, and maintainability. This change aligns with naming conventions used elsewhere in the project.

**Acceptance Criteria:**
- [ ] `MacroProfileComp` is renamed to `MacroProfile` everywhere
- [ ] All imports and usages are updated
- [ ] Exported JSDoc is updated
- [ ] All affected tests and documentation are reviewed and updated

**Additional Context:**
- See `docs/audit_sections_profile.md` for related architectural notes

**Labels:**
- refactor
- complexity-medium
- ui
- documentation

**reportedBy:** github-copilot.v1
