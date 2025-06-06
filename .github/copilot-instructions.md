# Copilot Instructions (short version)

## Terminal Automation & Refactoring
- When performing large-scale refactors (e.g., renaming, import changes, code migrations), prefer using terminal commands (find, sed, grep, awk, etc.) for speed and consistency, especially in Linux/zsh environments.
- Document the exact commands used for reproducibility and team knowledge.
- After running batch commands, always run `npm run lint`, `npm run type-check`, and `npm run test` to catch issues early.
- If batch commands introduce errors that cannot be fixed automatically, resolve them manually and update or remove related tests as needed.

## Language
- Prefer English for code, comments, and commit messages for consistency and future scalability.
- UI text (labels, error messages, etc.) must be in Portuguese (pt-BR) if required by the product.
- Portuguese is acceptable for internal docs/discussions if the whole team is fluent.

## Naming & Structure
- Use descriptive, action-based names for all code (functions, files, components).
- Avoid generic names (e.g., utils, helper, data, group, Service, Manager).
- Organize code into logical modules/packages.

## Clean Architecture
- **Domain Layer:** Only pure business logic, no side effects, no API/UI. Never import or use `handleApiError` or any side-effect utility. Only throw pure errors (custom error classes if needed).
- **Application Layer:** Use cases, orchestration, data conversion, error handling. Must catch domain errors and call `handleApiError` with full context. No domain logic.

## Error Handling
- **Domain:** Only throws pure errors. Never uses `handleApiError` or side effects.
- **Application:** Always catches domain errors and calls `handleApiError` with context (`component`, `operation`, `additionalData`).
- **UI/Controller:** May also call `handleApiError` for UI-specific errors.
- Never throw or log errors directly in application code without also calling `handleApiError`.

**Example:**
```typescript
// Domain
throw new GroupConflictError('Group mismatch', { groupId, recipeId })
// Application
try {
  domainFunc()
} catch (e) {
  handleApiError(e, { component: 'ItemGroupForm', operation: 'submitGroup', additionalData: { userId } })
  throw e
}
```

## Domain vs Application Validation
- **Domain validation:** Pure, context-free rules (e.g., "a group cannot have duplicate items").
- **Application validation:** Rules that depend on user, permissions, UI state, or workflow context.

## Fire-and-Forget Promises & the `void` Operator
- Use `void` for fire-and-forget promises **only in event handlers or non-critical effects**, and only when all error handling is guaranteed in the application layer.
- Never use `.catch(() => {})` to silence errors. All errors must be handled in the application layer.
- Fire-and-forget should be the exception, not the rule. If the reason for `void` is not obvious, add a comment.
- **Checklist:**
  - The promise result is not needed for the user flow.
  - All error handling and user feedback are handled in the application layer.
  - Usage is limited to event handlers, parallel effects, or non-critical callbacks.
  - The reason for `void` is documented if not obvious.

**Example:**
```tsx
<button onClick={() => { void insertDayDiet(createDayDiet({ owner: currentUser().id, target_day: selectedDay, meals: DEFAULT_MEALS })) }}>
  Create blank day
</button>
```

## Formatting & Style
- Follow Prettier/ESLint for JS/TS and Black for Python. Use single quotes, no semicolons, trailing commas, 80 print width, 2-space tabs.
- Add comments only for complex logic or important decisions.

## TypeScript
- Prefer `type` aliases over `interface`. Never use `any`. Use strict boolean expressions.

## JSX/Accessibility
- Always provide `alt` text for images. Follow accessibility best practices.

## Imports
- Always use static imports at the top of the file.

## Testing
- Write/update tests for all new features and bug fixes. Update or remove related tests when changing code.
- After any change, run `npm run lint`, `npm run type-check`, and `npm run test`.

## Commits
- Prioritize small, atomic commits. Never make an empty commit. Suggest a commit message after additions, refactors, or removals.

## Code Reviews
- All code must be ready for review, meet standards, and pass all tests before PR.

## 💡 Additional Suggestions

- Never import frontend libraries inside application or domain layers.
- Never mutate arguments or shared objects inside functions.
- Avoid unnecessary re-renders

---
For detailed rationale, anti-patterns, and advanced examples, see `CODESTYLE_GUIDE.md` and `ARCHITECTURE_GUIDE.md`.