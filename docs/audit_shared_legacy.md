# Shared & Legacy Audit

_Last updated: 2025-06-27_

## Overview
Shared and legacy code has been significantly reduced as part of the unified item system migration. All legacy item/item-group view and edit components, context providers, and related utilities have been removed. The codebase now relies on unified components and shared utilities for all item, group, and recipe flows.

## Major Legacy Code Removal (Completed)
- **Removed:** All legacy item, item-group, and related view/edit components, context providers, and helpers
- **Migrated:** All flows now use unified components and shared utilities for type conversion, validation, and macro logic
- **Isolated:** Remaining legacy utilities are isolated and scheduled for migration
- **Improved:** Test coverage and maintainability through unified factories and conversion utilities

## Findings
- **Code Quality & Type Safety Violations:**
  - **Forbidden `any` and `@ts-ignore` usage:** Instances of `(error as any).issues = err.issues` and `@typescript-eslint/no-explicit-any` found in `src/shared/utils/parseWithStack.ts`, and `@ts-ignore` in `src/app-version.ts`. These usages violate the strict rule in `GEMINI.md` that `any`, `as any`, or `@ts-ignore` are strictly forbidden outside the Infrastructure layer.

- **Legacy Utilities:** Most legacy utilities have been removed; remaining usage is isolated and scheduled for migration
- **Error Handling:** `handleApiError` is correctly isolated; shared code is imported appropriately
- **Migration:** The `legacy/` folder is nearly eliminated; boundaries are now clear

## Urgency
- **Low:** Continue migration of any remaining legacy utilities

## Next Steps
- [ ] List and migrate any remaining legacy/shared utility imports
- [ ] Propose migration steps for remaining legacy utilities
- [ ] Document shared module responsibilities and allowed usage

## Future Refinement Suggestions
- Create `audit_shared_legacy_<utility>.md` for any remaining high-risk utilities
- Map all shared/legacy code usage across the codebase
- Review shared code test coverage and migration blockers
- Continue systematic removal of legacy components as demonstrated by the item system migration
