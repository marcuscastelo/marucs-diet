# Testing Strategy and Organization Audit

_Last updated: 2025-07-08_

## Overview
This audit reviews the adherence to the project's testing strategy, specifically focusing on the organization and placement of test files.

## Key Findings
- **Test File Location:** The `GEMINI.md` states: "All tests for a module must be placed in its `tests/` folder." However, many `.test.ts` files are found directly within `application`, `domain`, and `infrastructure` subfolders of modules (e.g., `src/modules/diet/day-diet/application/dayDiet.test.ts`) instead of being consolidated under a dedicated `tests/` directory within their respective modules (e.g., `src/modules/diet/day-diet/tests/`).

## Urgency
- **Medium:** This inconsistency makes it harder to quickly locate all tests for a given module and violates the stated project guidelines.

## Next Steps
- [ ] Consolidate all `.test.ts` files into a `tests/` subfolder within their respective modules.
- [ ] Update import paths for moved test files.
- [ ] Ensure CI/CD pipelines correctly discover and run tests from the new locations.
