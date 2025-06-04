# Instructions

## Language
- All code, comments, documentation, and commit messages must be in English.
- Exception: UI text (labels, error messages, etc.) may be in Portuguese (pt-BR) if required by the product.
- Do not use Portuguese elsewhere.

## Naming & Structure
- Use descriptive, specific names for functions, files, and components.
- Functions: Use action verbs (e.g., isRecipedGroupUpToDate, convertToGroups, addItemsToGroup).
- Files: Name by specific purpose (e.g., comparison.ts, itemGroupService.ts, macroOverflow.ts).
- Components: Use complete, descriptive names (e.g., ItemGroupEditModal, ExternalTemplateSearchModal).
- Avoid generic names (e.g., utils.ts, helper.ts, group(), item(), data(), Editor, Service, Manager).
- Organize code into logical modules and packages, following the project's directory structure.

## Clean Architecture
- Domain Layer (`~/modules/*/domain/`): Only pure business logic, no side effects, no API/UI.
- Application Layer (`~/modules/*/application/`): Use cases, orchestration, data conversion. No domain logic.

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

## Commits
- Prioritize small, atomic commits.
- Never make an empty commit.
- After refactoring, suggest the user to commit the changes.
- Suggest a commit message after additions, refactors, or removals.

## Code Reviews
- All code must be ready for review, meet standards, and pass all tests before PR.

## Error Handling
- All errors in domain and application layers must use the shared error handler utility.
- Use `handleApiError` from `~/shared/error/errorHandler` for logging, reporting, or propagating errors.
- Never throw or log errors directly without also calling `handleApiError`.
- Always provide context (component, operation, additionalData).

**Example:**
```typescript
import { handleApiError } from '~/shared/error/errorHandler'

if (somethingWentWrong) {
  handleApiError(new Error('Something went wrong'), {
    component: 'itemGroupDomain',
    operation: 'isRecipedGroupUpToDate',
    additionalData: { groupId, groupRecipeId },
  })
  throw new Error('Something went wrong')
}
```

## Component Duplication
- Avoid duplicating logic between components (e.g., clipboard logic in MealEditView.tsx and RecipeEditView.tsx).
- Refactor shared logic into utilities or hooks.

## SolidJS Best Practices
- Always wrap side effects inside `createEffect` or similar reactive primitives (`createMemo`, `createResource`).
- Never access reactive signals (`createSignal`) directly inside JSX without a function call: use `count()` instead of `count`.
- Avoid destructuring signals, as this breaks reactivity:
  - Do not do: `const { value } = someSignal`
  - Do: `const [value] = someSignal`
- Use `createMemo` to avoid recalculating expensive derived values unnecessarily.
- Prefer `Show`, `Switch`, and `For` from `solid-js` instead of inline ternaries and array `.map()` for conditional and dynamic rendering.
- Always clean up effects if using `onCleanup`.
- SolidJS components must be named with CapitalCase and return JSX.
- Do not use React hooks (`useEffect`, `useState`, etc.). Use Solid signals and effects instead.
- Avoid spreading props directly unless necessary, as it may break reactivity.
- Wrap event handlers with arrow functions to avoid extra re-renders unless performance dictates otherwise.
- Prefer fine-grained reactivity over global state when possible.
- Avoid using stores (`createStore`) for highly dynamic or nested state — prefer `createSignal` or `createMemo`.
- When using `createStore`, prefer shallow updates or use `produce` to avoid performance bottlenecks.
- Use `eslint-plugin-solid` to detect invalid reactivity patterns and non-idiomatic practices.
- Follow the official `solid-start` template recommendations if using SSR or advanced routing.
- For Solid components, use `@solidjs/testing-library`.
- Always render components inside `render(<Component />)` and use `waitFor` for async tests.
- Use `screen.getByRole`, `screen.queryByText`, etc., to ensure accessibility in tests.
````

## Restrictions
- Do not modify `.eslintrc.cjs` or `.github/copilot-instructions.md` without user consent.

## See Also
- For module structure, layering, and architecture, see [`ARCHITECTURE_GUIDE.md`](../ARCHITECTURE_GUIDE.md).