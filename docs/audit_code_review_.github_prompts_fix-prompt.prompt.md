# Audit: .github/prompts/fix-prompt.prompt.md

## Summary of Changes
- New prompt file added for diagnosing and fixing misconfigured prompt files based on user complaints.
- Requires explicit user confirmation before applying fixes.
- Enforces propagation of `reportedBy` field for all learnings and blockers.

## Strengths
- Provides a robust workflow for prompt correction and user-driven refinement.
- Ensures traceability and attribution of all learnings and blockers.
- Prevents premature or unwanted prompt changes.

## Issues/Concerns
- The process may be slower due to the confirmation step.
- Requires careful handling of user complaints and expectations.

## Recommendations
- Periodically review the prompt for clarity and user experience.
- Consider automating complaint parsing and expected behavior extraction.
