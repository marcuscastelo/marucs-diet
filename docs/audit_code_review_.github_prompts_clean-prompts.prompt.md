# Audit: .github/prompts/clean-prompts.prompt.md

## Summary of Changes
- New prompt file added for cleaning and fixing prompt leaks, inconsistencies, and structure in `.github/prompts`.
- Defines agent workflow for prompt integrity, metadata validation, and actionable reporting.

## Strengths
- Provides a clear, actionable process for prompt hygiene and maintenance.
- Enforces unique metadata, actionable English, and best practices.
- Prevents prompt leaks and ensures self-contained, relevant prompt files.

## Issues/Concerns
- The agent must be careful not to alter protected prompt files as specified.
- May require regular updates as new prompt types or requirements are added.

## Recommendations
- Periodically review prompt files for new types of leaks or inconsistencies.
- Consider automating prompt integrity checks as part of CI/CD.
