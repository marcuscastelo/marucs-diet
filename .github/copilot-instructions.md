---
applyTo: "**"
---
# Copilot Instructions (short version)
During this session, always wait until the end of the execution of any requested command or process, even if it takes several minutes, before responding. For every command, redirect both stdout and stderr to `/tmp/copilot-terminal` using `| tee /tmp/copilot-terminal 2>&1`. After the main command finishes, check `cat /tmp/copilot-terminal`. Never repeat the main command. Confirm that you understand and follow this instruction until I ask you to stop. Never combine commands with `&&`, `||` or `;`

## Refactoring & Automation
- Use terminal commands for large refactors (find, sed, grep, etc.) and document them.
- After batch changes, always run: `npm run check`. Wait for the message "All checks passed" to appear

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

## Testing
- Update tests for all changes. Run `npm check` and wait for "All checks passed"