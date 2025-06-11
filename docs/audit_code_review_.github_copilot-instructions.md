# Audit: .github/copilot-instructions.md

## Summary of Changes
- Enhanced terminal output checking: now requires repeated polling of output files until explicit success or error message is found.
- Added detailed checklist templates for session learnings and blockers.
- Added requirements for documenting user frustration signals and shell/OS-specific requirements.
- Added journal file management and end-session declaration rules.
- Added Copilot Global Instructions for API, shell, and accessibility best practices.
- Changed formatting rule to prefer ESLint over Prettier.

## Strengths
- Improves reliability and traceability of terminal command output handling.
- Provides clear, actionable checklists for session learnings and blockers.
- Enforces robust documentation of user frustration and workflow blockers.
- Clarifies global rules for shell/OS compatibility and Copilot API usage.
- Strengthens process for end-session and journal file management.

## Issues/Concerns
- The instruction set is growing in length and complexity, which may reduce agent efficiency if not modularized.
- Some rules may overlap with other prompt files, risking duplication.
- The requirement to never proceed until explicit output is found may cause agent stalls if output is ambiguous or missing.

## Recommendations
- Consider modularizing global instructions and referencing them from individual prompts to reduce duplication.
- Add explicit error handling guidance for ambiguous or missing terminal output.
- Periodically review and refactor the instruction set for clarity and conciseness.
