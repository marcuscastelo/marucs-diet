# Marucs Diet – Codebase Style & Anti-Patterns Guide

This document serves as a reference to keep the codebase clean, idiomatic, and sustainable. It lists non-idiomatic patterns found in the project and recommendations to avoid them.

---

## 1. **Naming**
- **Avoid generic or ambiguous names**: Use clear and descriptive names for functions, variables, and files.
- **Consistency**: Always use camelCase for variables/functions and PascalCase for types/classes/components.
- **Avoid obscure acronyms**: Prefer full, self-explanatory names.
- **Files should reflect their content**: A file named `groupUtils.ts` should only contain group utilities, not domain or application logic.

## 2. **File and Folder Organization**
- **Domain vs Application vs Infrastructure**: Clearly separate domain entities, application logic (services, converters), and infrastructure (adapters, gateways).
- **Avoid catch-all files**: Don’t bundle miscellaneous utilities into a single file (e.g., `utils.ts`). Prefer small, focused files.
- **Remove legacy files**: Don’t keep obsolete or migrated files. Use version control for history.

## 3. **Code Patterns**
- **Avoid static classes**: Prefer individually exported pure functions. Static classes are rarely idiomatic in modern JS/TS, especially with React/SolidJS.
- **Do not use inline imports**: Always import types and functions at the top of the file. Bad example: `import('...').Type` inside a type.
- **Avoid unnecessary OOP**: Modern JS/TS and reactive frameworks favor functional programming and composition.
- **Do not use JSON.stringify for object comparison**: Implement deep comparison functions (`deepEquals`, `macrosAreEqual`).
- **Avoid `any` or fragile type guards**: Prefer explicit type guards and strong typing.
- **Do not mix responsibilities**: Don’t place application logic (e.g., converters, validators) inside domain code.
- **Do not use side-effectful functions in hooks**: Hooks should be predictable and pure.

## 4. **Componentization and Reusability**
- **Avoid logic duplication across components**: Extract shared logic to hooks or utilities.
- **Components should be small and focused**: One component = one responsibility.
- **Prefer composition over inheritance**: Use hooks and functions to share logic.

## 5. **Error Handling**
- **Use centralized error-handling functions**: Example: `handleValidationError`.
- **Do not expose generic error messages**: Error messages should be clear and traceable.

## 6. **Testability**
- **Pure functions are easier to test**: Avoid global dependencies and side effects.
- **Separate UI logic from business logic**: Enables easier unit and integration testing.

## 7. **General Best Practices**
- **Prefer const/let over var**
- **Avoid object mutation**: Use spread/rest to create new objects/arrays.
- **Document public functions and types**
- **Prefer arrow functions for small functions**
- **Use ESLint/Prettier for automatic formatting**

---

## Examples of Found Anti-Patterns
- Use of static classes for services (e.g., `ItemGroupService`)
- Inline imports of types
- Object comparison using `JSON.stringify`
- Conversion functions placed in the domain instead of the application
- Legacy files not removed after migration
- Duplicated logic between components (e.g., group pasting in Recipe/Meal)

---

## References
- [Clean Architecture (Uncle Bob)](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Idiomatic React Patterns](https://react.dev/learn/thinking-in-react)
- [Idiomatic TypeScript](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

**Keep this guide updated as the project evolves!**
