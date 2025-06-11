# Audit: .github/prompts/test.prompt.md

## Summary of Changes
- New prompt file added for unit test creation/update agent.
- Enforces best practices for test coverage, static imports, and ESLint compliance.
- Requires commit message suggestion after test changes.

## Strengths
- Provides a clear, actionable workflow for test creation and update.
- Ensures alignment with project conventions and best practices.
- Reduces risk of missing or outdated tests after code changes.

## Issues/Concerns
- The agent must ensure all exports are covered and tests are updated after changes.
- Requires careful handling of incomplete or unclear files.

## Recommendations
- Periodically review the prompt for clarity and completeness.
- Consider automating test coverage checks as part of CI/CD.
