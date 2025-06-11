# Session Learnings for Next Input

## Checklist (Actionable Learnings & Blockers)
- [x] **Signal Mutability for Dynamic Lists:** Use mutable signals (not derived) for lists that require in-place mutation (e.g., dismiss/advance flows for top contributors).
- [x] **Explicit Event Typing in JSX:** Always type event handler parameters in JSX (e.g., `(e: MouseEvent) => ...`) to avoid implicit any errors and pass strict lint/type checks.
- [x] **Inline Logic for One-off UI Actions:** For UI actions used only once (e.g., a Max button), implement logic inline to avoid unused import warnings and keep the codebase clean.
- [x] **Terminal Output Checking:** After running any terminal command (e.g., `npm run check`), check the output file (e.g., `cat /tmp/copilot-terminal-N`) repeatedly until a clear success or error message is found. Never rerun the main command. This is especially important in zsh/Linux environments.
- [x] **Remove Unused Imports Immediately:** Remove unused imports as soon as possible to pass lint/type checks and avoid workflow blockers.
- [x] **Commit Message Guidance:** Commit messages should summarize not only code changes but also workflow or UI/UX improvements, especially when user interaction patterns are changed.
- [x] **Shell/OS-Specific Requirements:** All shell commands and output checks must be compatible with zsh on Linux.
- [x] **Prompt Metadata/Workflow Issues:** Flag and document any prompt metadata or workflow issues encountered, so they can be addressed before the next session.

## What to Provide at the Start of Next Session
- Any custom workflow requirements (e.g., dismiss/advance UI, shortcut buttons, etc.).
- Any shell/OS-specific constraints (e.g., zsh, Linux, output file conventions).
- Any new or changed coding conventions (e.g., signal mutability, event typing, inline logic for UI actions).
- Any blockers or issues encountered in the previous session (e.g., lint/type errors, unused imports, prompt metadata issues).

# Prompt/Instruction Improvement Suggestions

- Add explicit checklist items for signal mutability, event typing, inline UI logic, and terminal output checking to all relevant guides and prompt templates.
- Instruct agents to always flag and document any prompt metadata or workflow issues encountered, so they can be addressed before the next session.
- Recommend that agents note any shell or OS-specific requirements that affected command execution, and that these be provided as context at the start of future sessions.
- Encourage the use of a checklist format for session learnings to ensure completeness and consistency.
- Add explicit examples of actionable learnings and blockers (e.g., missing commands, lint errors, invalid prompt metadata, shell/OS-specific issues) to the end-session prompt and documentation.

---

*This summary was generated automatically at the end of session on 2025-06-11. Saved in docs/.copilot-journal for future reference.*
