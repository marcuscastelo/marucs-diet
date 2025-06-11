# Audit: .github/prompts/code-review.prompt.md

## Summary of Changes
- New prompt file added for code review agent.
- Integrates automated analysis and reviewer feedback from PRs.
- Requires explicit user confirmation before applying suggestions.
- Emphasizes actionable, meta-level review and accessibility checks.

## Strengths
- Merges automated and human review for comprehensive coverage.
- Prevents premature or unwanted code changes by requiring user confirmation.
- Explicitly documents actionable learnings and blockers for future sessions.
- Strong focus on accessibility and workflow blockers.

## Issues/Concerns
- The process may be slower due to the confirmation step.
- Requires robust handling of reviewer feedback extraction and filtering.

## Recommendations
- Consider automating reviewer feedback parsing for efficiency.
- Periodically review the prompt for clarity and alignment with evolving workflow needs.
