# Instructions

## Language
- Prefer English for code, comments, and commit messages for consistency and future scalability.
- Exception: UI text (labels, error messages, etc.) must be in Portuguese (pt-BR) if required by the product.

## Naming & Structure
- Use descriptive, specific names for functions, files, and components.
- Functions: Use action verbs (e.g., isRecipedGroupUpToDate, convertToGroups, addItemsToGroup).
- Files: Name by specific purpose (e.g., comparison.ts, itemGroupService.ts, macroOverflow.ts).
- Components: Use complete, descriptive names (e.g., ItemGroupEditModal, ExternalTemplateSearchModal).
- Avoid generic names (e.g., utils.ts, helper.ts, group(), item(), data(), Editor, Service, Manager).
- Organize code into logical modules and packages, following the project's directory structure.

## Clean Architecture
- Domain Layer (`~/modules/*/domain/`): Only pure business logic, no side effects, no API/UI. **Never import or use `handleApiError` or any side-effect utility. Only throw pure errors (custom error classes if needed).**
- Application Layer (`~/modules/*/application/`): Use cases, orchestration, data conversion, error handling. Responsible for catching errors from the domain and calling `handleApiError` with full context. No domain logic.

## Error Handling
- **Domain layer:** Only throws pure errors. Never imports or uses `handleApiError` or any side-effect utility.
- **Application layer:** Always catches errors from domain and calls `handleApiError` with context (`component`, `operation`, `additionalData`).
- **UI/Controller:** May also call `handleApiError` for UI-specific errors.
- Always provide context (component, operation, additionalData).
- Never throw or log errors directly in application code without also calling `handleApiError`.

**Example:**
```typescript
// Domain
throw new GroupConflictError('Group mismatch', { groupId, recipeId })

// Application
try {
  domainFunc()
} catch (e) {
  handleApiError(e, {
    component: 'ItemGroupForm',
    operation: 'submitGroup',
    additionalData: { userId }
  })
  throw e
}
```

## Domain vs Application Validation
- **Domain validation:** Pure, context-free rules (e.g., "a group cannot have duplicate items").
- **Application validation:** Rules that depend on user, permissions, UI state, or workflow context.

## Fire-and-Forget Promises & the `void` Operator
- Use the `void` operator for fire-and-forget promises **only in event handlers or non-critical effects**, and only when all error handling is guaranteed in the application layer.
- Do **not** use `.catch(() => {})` to silence errors. All errors must be handled in the application layer, and the `void` operator signals that the promise is intentionally not awaited in the UI.
- Fire-and-forget should be the exception, not the rule. If the reason for `void` is not obvious, add a comment.
- **Checklist:**
  - The promise result is not needed for the user flow.
  - All error handling and user feedback are handled in the application layer.
  - Usage is limited to event handlers, parallel effects, or non-critical callbacks.
  - The reason for `void` is documented if not obvious.

**Example:**
```tsx
// OK: fire-and-forget, feedback handled in application layer
<button onClick={() => {
  void insertDayDiet(createDayDiet({
    owner: currentUser().id,
    target_day: selectedDay,
    meals: DEFAULT_MEALS,
  }))
}}>
  Create blank day
</button>
```

## Formatting & Style
- Formatting must be consistent throughout the codebase. Use Prettier/ESLint for JS/TS and Black for Python to ensure proper indentation, spacing, and line breaks.
- Always use single quotes for strings.
- No semicolons at end of statements.
- Use trailing commas where valid in ES5.
- Arrow functions always with parentheses.
- Print width: 80, tab width: 2 spaces.
- Consistent indentation and formatting are required across all files.
- Maintain consistent naming conventions for all identifiers.
- Add comments to explain complex logic or important decisions, but avoid comments that state the obvious.
- Never add a comment in the code explaining to the developer the refactor made by the Copilot agent.

## TypeScript
- Prefer `type` aliases over `interface`.
- Never use `any`.
- Prefer explicit types, but allow inferred return types.
- Do not throw non-Error objects.
- Remove or use all declared variables.
- Use strict boolean expressions.

## JSX/Accessibility
- Always provide `alt` text for images.
- Follow accessibility best practices for ARIA roles and properties.

## Imports
- Always use static imports at the top of the file. No dynamic/inline imports.

## Testing
- Write unit tests for all new features and bug fixes, covering edge cases.
- Update or add test files in the same commit as code changes.
- For every code change (including refactoring, renaming, or moving code), always search for and update all related test files in the same commit.
- If a function, class, or file is changed, renamed, or removed, ensure all corresponding tests are also updated, renamed, or removed accordingly.
- After any change, run `npm type-check` and `npx vitest run` and fix all problems immediately.
- Never leave orphaned or outdated tests after a code change.

## Testing & Validation
- After any major change (refactor, feature, or bug fix), always run:
  - `npm run lint`
  - `npm run type-check`
  - `npm run test`
- Fix all reported issues before committing or opening a pull request.

## Commits
- Prioritize small, atomic commits.
- Never make an empty commit.
- After refactoring, suggest the user to commit the changes.
- Suggest a commit message after additions, refactors, or removals.

## Code Reviews
- All code must be ready for review, meet standards, and pass all tests before PR.