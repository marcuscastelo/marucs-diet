reportedBy: github-copilot.v1/refactor

# Copilot Instructions (Long Version)

This document provides a complete and example-rich version of the Copilot usage and coding standards to be enforced during a development session. It is meant to be read and understood by both human collaborators and Copilot agents.

---

## Runtime Behavior: Terminal Execution

### Rules

* **Wait for completion**: Always wait for the command or process to finish execution, even if it takes several minutes.
* **Redirect output**: Use `| tee /tmp/copilot-terminal-[N] 2>&1` to redirect both stdout and stderr to a uniquely numbered file for every command.
* **Check output**: After each command, run `cat /tmp/copilot-terminal-[N]` to validate success before proceeding.
* **Avoid chaining**: Do **not** use `&&`, `||`, or `;` in terminal commands.

### Example

```bash
npm run check | tee /tmp/copilot-terminal-3 2>&1
cat /tmp/copilot-terminal-3
```

---

## Refactoring & Automation

* Use shell tools (`find`, `grep`, `sed`, etc.) for batch changes.
* After any batch edit or large code change, always run:

  ```bash
  npm run check
  ```
* Only proceed if output contains: `All checks passed`

---

## JSDoc Standards

* Only write JSDoc for **exported** functions or types.
* Keep it concise. No long explanations or internal details.
* Always in **English**.

### Example

```ts
/**
 * Calculates the total revenue.
 * @param transactions List of transactions to aggregate.
 * @returns Sum of all transaction values.
 */
export function calculateRevenue(transactions: Transaction[]): number { ... }
```

---

## Language

* **Code, comments, and commits**: English only.
* **UI text**: May be in English or pt-BR depending on context.
* **Identifiers**: Never use Portuguese. Use clear, action-based English names.

---

## Clean Architecture Rules

| Layer       | Allowed Actions                                  | Prohibited                    |
| ----------- | ------------------------------------------------ | ----------------------------- |
| Domain      | Pure logic, type defs, value objects             | Side effects, handleApiError  |
| Application | Use cases, orchestrate, catch errors, log issues | Business logic, domain errors |

---

## Error Handling

* Domain layer must never log or catch.
* Application layer must **always** catch and call `handleApiError` with full context.
* No silent errors or empty `.catch()` blocks.

### 🔴 Incorrect

```ts
someAsyncOp().catch(() => {})
```

### ✅ Correct

```ts
try {
  await someAsyncOp()
} catch (error) {
  handleApiError(error, 'sync task context')
}
```

---

## Promises

* Use `void` only for **non-critical** fire-and-forget use, like logging in UI event handlers.
* Never use `.catch(() => {})` or let promises fail silently.

---

## Formatting & Style

* Use Prettier and ESLint.
* Prefer `type` aliases over `interface` for data shapes.
* Avoid use of `any` entirely.

---

## Imports

* **Always** use static imports at the top of the file.
* Never use relative imports like `../foo`. Use `~/module/foo`.
* Never use dynamic imports (`import('...')`) even for lazy loading.
* If a component must be wrapped, use the wrapper not the inner.

---

## Context Propagation

* Avoid prop drilling for shared state.
* Prefer signals, stores, or global contexts where applicable.

---

## Testing

* Any change to code must be reflected in tests.
* Run `npm run check` to validate.
* Check for unused props, imports, or signals after changes.

---

## Commit Message Format

* Use **Conventional Commits**:

  * `feat(ui):`, `fix(api):`, `refactor(auth):`, etc.
* Format:

```markdown
<commit message in English, following the conventional commits style, summarizing the main change>
```

* No emojis, no Portuguese, no generic messages like `update` or `changes`

---

## Labels Usage (for GitHub Issues)

Always classify your issues with the following:

### Type (choose 1)

* `bug`, `feature`, `refactor`, `task`, `improvement`, `documentation`, `chore`, `epic`, `idea`

### Complexity (optional)

* `complexity-low`, `complexity-medium`, `complexity-high`, `complexity-very-high`

### Context/Status (optional)

* `blocked`, `needs-investigation`, `needs-design`, `may-return-in-the-future`, `todo :spiral_notepad:`

### Area (optional)

* `ui`, `backend`, `api`, `performance`, `data-consumption`, `accessibility`

### Refinement or Maintenance (optional)

* `refinement`, `epic`, `chore`, `refactor`, `improvement`

🛑 Remove generic labels like `todo :spiral_notepad:` after classifying the issue.

---

## Final Reminders

* Never explain *why* something is done in code. Comments are only for *what*.
* Keep changes atomic and traceable.
* Always clean up dead code, unused signals, or outdated test cases after a refactor.
* Never skip `handleApiError` in the application layer.
* Never use domain errors in application code.

---

Use this document to ensure every Copilot-assisted development session follows strict, predictable, and high-quality conventions.
