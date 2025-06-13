# Refactor Template

**Title:**
Set autofocus based on device type in TemplateSearchModal

**Description:**
Refactor the `TemplateSearchModal` component to detect the user's device type (desktop or mobile) and set autofocus behavior accordingly. Update all usages, types, and documentation to ensure context-aware focus management and improved user experience. Test on both desktop and mobile environments.

**Scope:**
- src/sections/search/components/TemplateSearchModal.tsx
- All files and modules referencing autofocus logic in TemplateSearchModal
- Related documentation and tests

**Motivation:**
Context-aware autofocus improves usability, especially for mobile users who may not want the keyboard to open automatically. This change will make the modal more intuitive and user-friendly across devices.

**Acceptance Criteria:**
- [ ] Autofocus is set based on device type
- [ ] All usages, types, and documentation are updated
- [ ] All affected tests are updated

**Additional Context:**
- Test on both desktop and mobile environments
- See `docs/audit_sections_search.md` for related notes

**Labels:**
- refactor
- improvement
- complexity-low
- ui

**reportedBy:** github-copilot.v1
