# Shared & Legacy Audit

_Last updated: 2025-06-19_

## Overview
Shared and legacy code provides utilities, error handling, and migration support. It should not break DDD boundaries or introduce side effects into domain/application layers.

## Major Legacy Code Removal (Completed)
**Significant legacy cleanup completed:** All legacy item/item-group view and edit components have been successfully removed from the codebase as part of the migration to the unified system:
- Removed `ItemView`, `ItemEditModal`, `ItemListView`, `ItemGroupView` and all related wrappers
- Eliminated `ItemContext` and other legacy context providers
- Removed `ExternalItemEditModal` and item-specific helper components
- Moved `RemoveFromRecentButton` from legacy location to `src/sections/common/components/buttons/`
- All functionality successfully migrated to unified components with proper type conversions

This represents a major reduction in legacy code surface area and technical debt.

## Findings
- **Legacy Utilities:** Some legacy utilities (e.g., `idUtils`, `supabase`) are still used in domain and application code.
- **Error Handling:** `handleApiError` is correctly isolated, but some shared code is imported inappropriately.
- **Migration:** The `legacy/` folder is under migration, but boundaries are not always clear.

## Urgency
- **High:** Remove legacy utility usage from domain code.
- **Medium:** Clarify migration plan and document shared module boundaries.

## Next Steps
- List all imports from `legacy/` and `shared/` in domain/application layers.
- Propose migration steps for remaining legacy utilities.
- Document shared module responsibilities and allowed usage.

## Future Refinement Suggestions
- Create `audit_shared_legacy_<utility>.md` for complex or high-risk utilities.
- Map all shared/legacy code usage across the codebase.
- Review shared code test coverage and migration blockers.
- Continue systematic removal of legacy components as demonstrated by the item system migration.
