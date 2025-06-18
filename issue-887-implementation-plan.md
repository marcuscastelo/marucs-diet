# Implementation Plan for Issue #887: Phase 2 - Infrastructure Layer for Item/ItemGroup Unification

## ⚠️ LLM Agent Guidance: Read Carefully Before Proceeding

This plan is written to instruct an LLM agent to execute the infrastructure migration for the unified Item/ItemGroup model. **Follow each step exactly.**

---

### 1. Domain Layer Review (Phase 1)
- Confirm the unified item schema is in `src/modules/diet/unified-item/schema/unifiedItemSchema.ts`.
- Confirm migration utilities in `domain/migrationUtils.ts` and `conversionUtils.ts`.
- Confirm unit tests for migration and schema are present and passing.

### 2. Infrastructure Context Analysis
- **Item/ItemGroup are NOT stored in separate tables or DAOs.**
- All Item/ItemGroup data is embedded as arrays inside the DayDiet object, persisted in the `days` (or `days_test`) table.
- All CRUD operations for Item/ItemGroup are performed via DayDiet repository/DAO (see `src/modules/diet/day-diet/infrastructure/supabaseDayRepository.ts`).
- There are NO queries, DAOs, or repositories for Item or ItemGroup directly.

### 3. Database Migration (User-Exclusive)
- **The database migration step must be executed exclusively by the user.**
- The agent must NOT generate SQL queries, psql commands, or attempt to run/modify the database schema directly.
- The agent should instead:
  - Collaborate with the user by providing guidance, checklists, and validation steps for the migration.
  - Wait for explicit user confirmation before proceeding to any step that depends on the database schema or data migration.
  - Offer to review migration scripts or plans if the user requests.
  - Never attempt to create, alter, or drop tables, columns, or indexes directly.

### 4. DayDiet Repository Refactor
- Update the DayDiet DAO/repository to:
  - Use the unified item array schema for all DayDiet operations.
  - Update all conversion/validation utilities to expect the unified format.
  - Ensure all fetch, insert, and update operations on DayDiet handle the unified item array.
- Remove any legacy code or references to old Item/ItemGroup structures.

### 5. Infrastructure Services
- Ensure all database connection, indexing, backup/restore, and monitoring logic works with the new embedded unified item array.
- **Do NOT create separate DAOs or repositories for Item or ItemGroup.**

### 6. Data Migration & Rollback Utilities
- Implement and test utilities to migrate and rollback embedded Item/ItemGroup data to/from the unified format **within DayDiet**.
- Collaborate with the user to validate that data migration is complete and correct.

### 7. Testing & Validation
- Achieve >95% test coverage for all affected modules.
- Test migration, rollback, and all DayDiet CRUD operations with the unified format.
- Benchmark performance and validate no regressions.

### 8. Documentation
- Update all documentation to reflect that Item/ItemGroup are now always embedded as a unified array inside DayDiet.
- Remove or update any references to separate Item/ItemGroup DAOs or tables.

### 9. Code Quality & Compliance
- Run all code quality checks and fix issues.
- Ensure all code and comments are in English.
- Remove unused code after refactor.
- Use only static imports.

### 10. Commit & Finalize
- Make atomic, conventional commits for each logical change.
- Final commit must summarize the transformation.
- Ensure branch is clean and ready for merge.

### 11. Success Criteria Checklist
- DayDiet stores and manipulates only the unified item array.
- Data migration completes without loss or corruption.
- All queries and operations continue to work as expected.
- Rollback procedures are tested and reliable.
- Integration and unit tests pass (>95% coverage).
- Migration scripts tested on staging.
- Performance benchmarks meet targets.
- Documentation updated.
- All code quality, functional, and architecture validations pass.
- All requirements from the issue are demonstrably met.
- All code and comments are in English.
- No dynamic imports or `.catch(() => {})` are introduced.
- All code is committed and the branch is clean.

---

#### Key Principle for the Agent
> **All Item/ItemGroup logic is handled as embedded arrays inside DayDiet. Do NOT create or expect separate DAOs, tables, or repositories for Item or ItemGroup. All migration, validation, and CRUD must operate on the DayDiet object as a whole.**
> **For all database migration steps, always collaborate with the user and never attempt to execute or generate SQL or database commands.**

---

**If you are an LLM agent, follow this plan step by step. If you encounter ambiguity, halt and request clarification.**
