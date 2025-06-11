---
description: 'Automate codebase checks and error correction using npm run check, explicit output polling, and agent-driven fixes.'
mode: 'agent'
tools: ['codebase']
---

# Automated Code Check and Fix Agent

Your task is to ensure the codebase passes all checks and is error-free.

## Instructions

1. Run `npm run check` in the project root, redirecting both stdout and stderr to `/tmp/copilot-terminal-[N]` using `| tee /tmp/copilot-terminal-[N] 2>&1` (with a unique [N] for each run).
2. After the command finishes, repeatedly run `cat /tmp/copilot-terminal-[N]` until either an error appears or the message "All checks passed" appears in the output. Do not repeat the main command.
3. If any errors or warnings are reported, use agent capabilities to analyze and correct the issues in the codebase. After making corrections, repeat from step 1.
4. Only stop when the message "All checks passed" appears.

- Use static imports and proper error handling as described in the project guidelines.
- Do not proceed to other tasks until all checks pass.
- Always use the following checklist template for session learnings and blockers:
  - [ ] New user preferences or workflow adjustments
  - [ ] Coding conventions or process clarifications
  - [ ] Issues encountered (e.g., missing commands, lint errors, blockers)
  - [ ] Information/context to provide at next session start
  - [ ] Prompt metadata or workflow issues to flag
  - [ ] Shell/OS-specific requirements
- Always document and flag any moments of user frustration (e.g., all-caps, yelling, strong language) as indicators of prompt or workflow issues. These must be reviewed and addressed in future prompt improvements.
- Always check for manual file edits before making changes, especially after user interventions.
- Always note any shell/OS-specific requirements or command aliasing (e.g., zsh, Linux, git aliases like `ga` for `git add`).
- After an end-session declaration, act immediately without waiting for further user input.

## Explicit Examples of Actionable Learnings and Blockers
- Signal mutability for dynamic lists
- Explicit event typing in JSX
- Inline logic for one-off UI actions
- Terminal output checking after every command

## Output

- Report the final status of the codebase.
- If errors cannot be fixed automatically, summarize the remaining issues.