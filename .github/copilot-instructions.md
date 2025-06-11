---
applyTo: "**"
---
# Copilot Instructions (short version)
During this session, always wait until the end of the execution of any requested command or process, even if it takes several minutes, before responding. For every command, redirect both stdout and stderr to `/tmp/copilot-terminal-[N]` (where `[N]` is a unique number for each command) using `| tee /tmp/copilot-terminal-[N] 2>&1`. After the main command finishes, check `cat /tmp/copilot-terminal-[N]`. Never repeat the main command. Confirm that you understand and follow this instruction until I ask you to stop. Never combine commands with `&&`, `||` or `;`

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
- Use Prettier/ESLint for JS/TS. Prefer type aliases, never any.

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

## Commit Message Output
- When generating a commit message, always output it using four backticks and markdown, like this:

````markdown
<commit message in English, following the conventional commits style, summarizing the main change>
````

- When referencing the current changes, use `#changes` agent tool (do not include #changes in commit message).