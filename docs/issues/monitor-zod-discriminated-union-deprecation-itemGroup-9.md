# Refactor Template

**Title:**
Monitor Zod discriminated union deprecation and prepare for schema refactor

**Description:**
Track the deprecation of discriminated unions in Zod and prepare to refactor schemas in the item group domain if/when this feature is removed or changed upstream. Update all affected modules, types, and documentation as needed.

**Scope:**
- src/modules/diet/item-group/domain/itemGroup.ts
- All files and modules using Zod discriminated unions
- Related documentation and tests

**Motivation:**
Monitoring upstream changes ensures future compatibility and avoids technical debt. Preparing for schema refactor in advance reduces the risk of breaking changes.

**Acceptance Criteria:**
- [ ] Monitor Zod releases for changes to discriminated unions
- [ ] Refactor schemas if/when necessary
- [ ] All affected documentation and tests are updated

**Additional Context:**
- Link to Zod issue: https://github.com/colinhacks/zod/issues/2106
- See `docs/audit_domain_diet_item-group.md` for related architectural notes

**Labels:**
- improvement
- complexity-low
- backend

**reportedBy:** github-copilot.v1
