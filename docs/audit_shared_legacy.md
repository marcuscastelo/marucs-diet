# Shared & Legacy Audit

## Overview
Shared and legacy code provides utilities, error handling, and migration support. It should not break DDD boundaries or introduce side effects into domain/application layers.

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
