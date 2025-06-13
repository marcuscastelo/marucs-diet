# Refactor Template

**Title:**
Remove idUtils and migrate all ID generation to the database

**Description:**
Remove the legacy `idUtils` utility and refactor all relevant code to ensure that IDs are generated exclusively by the database layer. This will centralize responsibility for ID generation, improve data consistency, and reduce technical debt.

**Scope:**
- src/legacy/utils/idUtils.ts
- All modules and files that import or use `idUtils`
- Database schema and migration scripts (if needed)

**Motivation:**
Centralizing ID generation in the database ensures atomicity, prevents duplicate or conflicting IDs, and aligns with best practices for distributed systems. Removing `idUtils` also reduces maintenance overhead and potential bugs from client-side ID generation.

**Acceptance Criteria:**
- [ ] All usages of `idUtils` are removed from the codebase
- [ ] All ID generation is handled by the database (e.g., via SERIAL, UUID, or equivalent)
- [ ] All affected modules and tests are updated
- [ ] Documentation is updated to reflect the new approach

**Additional Context:**
- Review all usages of `idUtils` in the codebase
- Update database schema/migrations if necessary
- See `docs/audit_domain_diet_api.md` for related architectural notes

**Labels:**
- refactor
- backend
- complexity-high
- data-consumption
- improvement

**reportedBy:** github-copilot.v1
