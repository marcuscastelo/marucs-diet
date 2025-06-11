# Audit: scripts/collect-commit-info.sh

## Summary of Changes
- New script added to collect staged diff, status, and file contents for commit message generation.
- Uses zsh array iteration for compatibility.
- Outputs all collected information to dedicated /tmp/copilot-terminal-N files.

## Strengths
- Centralizes and automates commit info collection for reliability.
- Ensures compatibility with zsh and Linux environments.
- Improves traceability and reproducibility of commit message generation.

## Issues/Concerns
- The script must be maintained to reflect any changes in workflow or shell environment.
- Potential for missed edge cases if not robustly tested.

## Recommendations
- Regularly review and test the script for compatibility and completeness.
- Document any shell/OS-specific requirements in the script header.
