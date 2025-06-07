# Application Layer Audit

## Overview
The application layer orchestrates use cases, handles errors, and bridges domain and infrastructure. It should catch domain errors and call `handleApiError` with context.

## Findings
- **Error Handling:** Most application code follows the pattern, but some error propagation is inconsistent.
- **Orchestration:** Some business logic may leak into UI or domain layers.
- **Type Safety:** Application layer generally maintains strong typing.

## Urgency
- **High:** Audit all error handling for missing `handleApiError` context.
- **Medium:** Review orchestration logic for business rule leakage.

## Next Steps
- List all application-layer entry points and check error handling.
- Refactor orchestration logic to keep business rules in domain.
- Expand audit to async flows and side effects.

## Future Refinement Suggestions
- Create `audit_application_<module>.md` for modules with complex orchestration.
- Analyze async flows and error propagation in detail.
- Review application-level test coverage and integration points.
