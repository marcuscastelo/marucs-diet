# Refactor Template

**Title:**
Remove ID generation from createItem and delegate to database

**Description:**
Refactor the `createItem` logic so that all ID generation is handled exclusively by the database layer, not in application or domain code. Update all usages, types, and documentation to reflect this change. Ensure that the application layer and tests are updated to expect IDs from the database.

**Scope:**
- src/modules/diet/item/domain/item.ts
- All files and modules referencing `createItem` or handling item IDs
- Related documentation and tests

**Motivation:**
Centralizing ID generation in the database ensures atomicity, prevents duplicate/conflicting IDs, and aligns with best practices for distributed systems. This reduces technical debt and improves data consistency.

**Acceptance Criteria:**
- [ ] ID generation is removed from `createItem` and all related code
- [ ] Database handles all ID generation for items
- [ ] All usages, types, and documentation are updated
- [ ] All affected tests are updated

**Additional Context:**
- Review all usages of `createItem` in the codebase
- Update database schema/migrations if necessary
- See `docs/audit_domain_diet_item.md` for related architectural notes

**Labels:**
- refactor
- backend
- complexity-medium
- improvement

**reportedBy:** github-copilot.v1
