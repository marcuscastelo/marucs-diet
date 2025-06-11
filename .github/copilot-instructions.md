---
applyTo: "**"
---
# Copilot Instructions (short version)
During this session, always wait until the end of the execution of any requested command or process, even if it takes several minutes, before responding. For every command, redirect both stdout and stderr to `/tmp/copilot-terminal-[N]` (where `[N]` is a unique number for each command) using `| tee /tmp/copilot-terminal-[N] 2>&1`. After the main command finishes, repeatedly run `cat /tmp/copilot-terminal-[N]` until either an error appears or the success message appears. Never repeat the main command. Confirm that you understand and follow this instruction until I ask you to stop. Never combine commands with `&&`, `||` or `;`

## Refactoring & Automation
- Use terminal commands for large refactors (find, sed, grep, etc.) and document them.
- After batch changes, always run: `npm run check`. Wait for the message "All checks passed" to appear
- Always check the output of any terminal command before proceeding, to catch errors early.

## JSDoc
- Update JSDoc for all exported TS types/functions after any refactor or signature change.
- Never add JSDoc to internal (non-exported) code.
- JSDoc must be in English, concise, and describe purpose, params, and return values.
- Remove outdated JSDoc if exports change.

## Language
- Code/comments/commits in English. UI text in pt-BR if required.

## Naming & Structure
- Use descriptive, action-based names. Avoid generic names. Organize by module.

## Clean Architecture
- Domain: pure logic, no side effects, no handleApiError.
- Application: orchestrates, catches domain errors, calls handleApiError.

## Error Handling
- Domain: only throws pure errors.
- Application: always calls handleApiError with context.
- Never log/throw errors in app code without handleApiError.

## Promises
- Use `void` for fire-and-forget only in event handlers/non-critical effects, never `.catch(() => {})`.

## Formatting & Style
- Use ESLint for JS/TS. Prefer type aliases, never any.

## Imports
- Always use static imports at the top.
- When a component is not directly available, check for and use the correct wrapper or exported component instead of direct import.
- NEVER use relative imports. Always use ~/<fullpath> for imports.
- Never use dynamic imports. Always use static imports at the top of the file.

## Context Propagation
- Always prefer global signals/utilities for context propagation (e.g., macro context) over property drilling, especially for shared state.

## Testing
- Update tests for all changes. Run `npm check` and wait for "All checks passed"

## Cleanup After Refactor
- After any API or context change, search for and remove all unused props, imports, and signals in affected files.

# Additional Enforcement
- Never add explanatory comments in the code. Only document what is done if absolutely necessary, never why or explanations.
- Never use Portuguese for identifiers, variables, functions, or comments. Only UI text may be in English or pt-BR as required.
- Prefer small, atomic commits. Always suggest a commit message after making changes.
- Always update or remove related tests when changing code.
- Application layer must always call handleApiError with context.
- Never use handleApiError in domain code.
- Never use `.catch(() => {})` in promises.

## Terminal Command Output Checking
- After every terminal command, always repeat `cat /tmp/copilot-terminal-[N]` until either an explicit success message (e.g., "All checks passed") or an error appears. Never stop after a single check. Never repeat the main command.
- Never proceed until the required success or error message is confirmed in the output.

## Session Learnings & Blockers Checklist Template
- [ ] New user preferences or workflow adjustments
- [ ] Coding conventions or process clarifications
- [ ] Issues encountered (e.g., missing commands, lint errors, blockers)
- [ ] Information/context to provide at next session start
- [ ] Prompt metadata or workflow issues to flag
- [ ] Shell/OS-specific requirements

## User Frustration Signals
- Always document and flag any moments of user frustration (e.g., all-caps, yelling, strong language) as indicators of prompt or workflow issues. These must be reviewed and addressed in future prompt improvements.

## Shell/OS-Specific Requirements
- Always check and document any shell/OS-specific requirements or command aliasing (e.g., zsh, Linux, git aliases like `ga` for `git add`).

## Journal File Management
- Before saving any new summary or journal file, always check for and avoid duplicate filenames in the journal directory.

## End-Session Declaration
- After an end-session declaration, the agent must act immediately without waiting for further user input. Actions must be immediate and self-contained.

## Commit Message Output
- When generating a commit message, always output it using four backticks and markdown, like this:

````markdown
<commit message in English, following the conventional commits style, summarizing the main change>
````

- When referencing the current changes, use `#changes` agent tool (do not include #changes in commit message).

# Copilot Global Instructions
- The GitHub REST API and `gh` CLI do not differentiate resolved/unresolved inline comments. If filtering is required, fallback to the GraphQL API. (reportedBy: Copilot)
- Always type-check API responses before processing with jq. (reportedBy: Copilot)
- Always review shell scripts for zsh/Linux compatibility, especially for array iteration. (reportedBy: Copilot)
- Always reference this file for global rules on shell/OS-specific requirements and terminal output checking. (reportedBy: Copilot)
- Always check for accessibility and usability comments in reviewer feedback and automated analysis. (reportedBy: Copilot)