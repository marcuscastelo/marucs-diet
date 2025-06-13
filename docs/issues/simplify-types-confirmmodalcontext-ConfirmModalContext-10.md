# Refactor Template

**Title:**
Simplify types in ConfirmModalContext using Accessor types

**Description:**
Refactor the `ConfirmModalContext` to use `Accessor<Title>` and `Accessor<Body>` types where appropriate, replacing function types. Update all usages, related types, and documentation to reflect this simplification.

**Scope:**
- src/sections/common/context/ConfirmModalContext.tsx
- All files and modules referencing ConfirmModalContext types
- Related documentation and tests

**Motivation:**
Simplifying types improves type safety, code readability, and maintainability. Using `Accessor` types makes the context API more predictable and easier to use.

**Acceptance Criteria:**
- [ ] Types in `ConfirmModalContext` are simplified as described
- [ ] All usages, types, and documentation are updated
- [ ] All affected tests are updated

**Additional Context:**
- See `docs/audit_sections_common.md` for related notes

**Labels:**
- improvement
- complexity-low
- ui

**reportedBy:** github-copilot.v1
