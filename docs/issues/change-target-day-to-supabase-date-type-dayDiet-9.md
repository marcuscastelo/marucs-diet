# Feature Request Template

**Title:**
Change target_day to Supabase date type for improved compatibility

**Description:**
Update the `target_day` field in the day diet domain to use the Supabase date type. Refactor all usages, types, and documentation to ensure compatibility and type safety. Test all affected features for regressions.

**Motivation:**
Using the correct Supabase date type ensures database compatibility, improves type safety, and reduces the risk of bugs related to date handling.

**Proposed Solution:**
- Update the schema and types for `target_day` to use the Supabase date type
- Refactor all usages and related code
- Test all affected features for regressions

**Acceptance Criteria:**
- [ ] `target_day` uses the correct Supabase date type
- [ ] All usages and related code are updated
- [ ] All affected tests and documentation are updated

**Additional Context:**
- See `docs/audit_domain_diet_day-diet.md` for related architectural notes

**Labels:**
- improvement
- complexity-low
- backend

**reportedBy:** github-copilot.v1
