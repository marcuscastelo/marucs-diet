---
applyTo: "**"
---
# Copilot Instructions (short version)
During this session, always wait until the end of the execution of any requested command or process, even if it takes several minutes, before responding. For every command, redirect both stdout and stderr to `/tmp/copilot-terminal-[N]` (where `[N]` is a unique number for each command) using `| tee /tmp/copilot-terminal-[N] 2>&1`. After the main command finishes, check `cat /tmp/copilot-terminal-[N]`. Never repeat the main command. Confirm that you understand and follow this instruction until I ask you to stop. Never combine commands with `&&`, `||` or `;`

## Terminal & Script Usage
- Always check for the existence of referenced scripts (e.g., `.scripts/semver.sh`) before using them. If missing, suggest alternatives or prompt the user.
- The preferred method for app version reporting is `.scripts/semver.sh`, not `git describe --tags --always`.
- Always verify the correct script directory (e.g., `.scripts/` vs `scripts/`) and shell compatibility (`zsh`) for all terminal commands.
- If a script is missing or not executable, add a troubleshooting step or warning.

## Codebase Check & Output Validation
1. Run `npm run copilot:check` in the project root, redirecting both stdout and stderr to `/tmp/copilot-terminal-[N]` using `| tee /tmp/copilot-terminal-[N] 2>&1` (with a unique [N] for each run).
2. After the command finishes, run each of the following custom scripts (each should simply output the contents of `/tmp/copilot-terminal-[N]`):
   - `.scripts/cat1.sh /tmp/copilot-terminal-[N]`
   - `.scripts/cat2.sh /tmp/copilot-terminal-[N]`
   - `.scripts/cat3.sh /tmp/copilot-terminal-[N]`
   Check the output of each script, in order, until either:
   - The message "COPILOT: All checks passed!" appears in the output, or
   - Any of the following error patterns (case-insensitive) appear: `failed`, `at constructor`, `error`, `replace`, or similar.
   - Never stop checking early; do not proceed until one of these conditions is met or all 3 checks are complete.
   - Always use the latest output file for checking.
3. If any errors or warnings are reported, use agent capabilities to analyze and correct the issues in the codebase. After making corrections, repeat from step 1.
4. Only stop when the message "COPILOT: All checks passed!" appears.

## Reporting and Attribution

- This session will have multiple agents. Everytime a new agent takes palace, it should announce it to the user
- Every agent that produces outputs intended for downstream processing or auditing **must include a `reportedBy` metadata field**.
- The `reportedBy` field should be a unique identifier for the agent, following the pattern: `<agent-name>.v<major-version>`.
- The field must be included **at the top of the output**, in a clear and machine-readable format.
- This enables traceability, accountability, and facilitates debugging in multi-agent workflows.
- Example:

```markdown
reportedBy: <agent-name.vXX>

### Session Learnings
- ...
```

- Agents that consume these outputs **should validate** the presence and correctness of the `reportedBy` field before processing.
- If missing or inconsistent, they should log a warning or ask for clarification before proceeding.

## Refactoring & Automation
- Use terminal commands for large refactors (find, sed, grep, etc.) and document them.
- After batch changes, always run: `npm run check` and follow the output validation process above. Wait for the message "COPILOT: All checks passed!" to appear.
- Always check the output of any terminal command before proceeding, to catch errors early.

## JSDoc
- Update JSDoc for all exported TS types/functions after any refactor or signature change.
- Never add JSDoc to internal (non-exported) code.
- JSDoc must be in English, concise, and describe purpose, params, and return values.
- Remove outdated JSDoc if exports change.

## Language
- Code/comments/commits in English. UI text in pt-BR if required.
- All code comments, including minor or nitpick comments, must be in English for consistency across the codebase, regardless of the original language of the code or user input.
- When reviewing or refactoring, explicitly flag and suggest converting any non-English comments to English.

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
- Use Prettier/ESLint for JS/TS. Prefer type aliases, never any.

## Imports
- Always use static imports at the top.
- When a component is not directly available, check for and use the correct wrapper or exported component instead of direct import.
- NEVER use relative imports. Always use ~/<fullpath> for imports.
- Never use dynamic imports. Always use static imports at the top of the file.

## Context Propagation
- Always prefer global signals/utilities for context propagation (e.g., macro context) over property drilling, especially for shared state.

## Testing
- Update tests for all changes. Run `npm run check` and follow the output validation process above. Wait for "COPILOT: All checks passed!".

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
- Never remove TODOs from the codebase, regardless of context.

## Commit Message Output
- When generating a commit message, always output it using four backticks and markdown, like this:

````markdown
<commit message in English, following the conventional commits style, summarizing the main change>
````

- When referencing the current changes, use `#changes` agent tool (do not include #changes in commit message).

# Label Usage

See `docs/labels-usage.md` for detailed instructions on how to use labels when creating issues.

## Quick Reference

- Always add at least one main type label: `bug`, `feature`, `refactor`, `task`, `improvement`, `documentation`, `chore`, `epic`, `idea`.
- Add complexity labels if possible: `complexity-low`, `complexity-medium`, `complexity-high`, `complexity-very-high`.
- Use status/context labels: `todo :spiral_notepad:`, `blocked`, `needs-investigation`, `needs-design`, `may-return-in-the-future`.
- Add area labels: `ui`, `backend`, `api`, `performance`, `data-consumption`, `accessibility`.
- Use refinement or grouping labels: `refinement`, `epic`.
- Use maintenance labels: `chore`, `refactor`, `improvement`.
- Always remove generic labels like `todo :spiral_notepad:` after classifying the issue.
- Do not use duplicate or conflicting labels.

For the full label table and descriptions, refer to `docs/labels-usage.md`.

## Search Features (pt-BR/Portuguese)
- All user-facing search features must be both diacritic-insensitive and case-insensitive for pt-BR/Portuguese contexts.