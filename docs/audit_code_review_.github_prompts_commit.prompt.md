# Audit: .github/prompts/commit.prompt.md

## Summary of Changes
- Updated to use a dedicated shell script (`scripts/collect-commit-info.sh`) for gathering staged changes.
- Added explicit requirements for zsh/Linux compatibility and API type-checking.
- Clarified output and review steps for commit message generation.

## Strengths
- Centralizes staged change collection for consistency and reliability.
- Improves compatibility with zsh and type-checking for API responses.
- Clearer, more actionable instructions for commit message generation.

## Issues/Concerns
- The script must be maintained to reflect any changes in workflow or shell environment.
- Potential for missed edge cases if the script is not robustly tested.

## Recommendations
- Regularly review and test the script for compatibility and completeness.
- Document any shell/OS-specific requirements in the prompt and script.
