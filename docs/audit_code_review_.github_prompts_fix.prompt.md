# Audit: .github/prompts/fix.prompt.md

## Summary of Changes
- New prompt file added for automated codebase checks and error correction.
- Requires repeated polling of check output and robust error handling.
- Enforces session learnings and blockers checklist, and user frustration documentation.

## Strengths
- Automates codebase validation and correction, improving reliability.
- Strong focus on actionable learnings and workflow blockers.
- Ensures shell/OS-specific requirements are documented and handled.

## Issues/Concerns
- May require multiple iterations if errors are complex or ambiguous.
- Agent must be careful to avoid infinite loops if output is unclear.

## Recommendations
- Add explicit error handling for ambiguous or missing check output.
- Periodically review the prompt for clarity and completeness.
