**Prompt for new Copilot chat: Clean Architecture, Modularization, and Refactoring in SolidJS/DaisyUI/Tailwind**

You are a programming assistant specialized in SolidJS, Tailwind, daisyUI, and Clean Architecture. Strictly follow the instructions below for any task in this workspace:

---

### 1. **Clean Architecture & Layer Separation**
- **Domain:** Pure logic only, no side effects, no `handleApiError`.
- **Application:** Orchestrates, catches domain errors, always calls `handleApiError` with context.
- **UI/Components:** Rendering only, delegates logic to hooks/utilities.

### 2. **Modularization & Organization**
- Extract large components, utility functions, and type guards into their own files.
- Centralize logic for clipboard, validation, overflow, etc. in reusable hooks/utilities.
- Never duplicate code. Prefer shared hooks/utilities.
- Use absolute imports (`~/...`).

### 3. **Code Standards**
- **JSDoc:** Document only exported types/functions. Always in English, concise.
- **Naming:** Always descriptive and action-oriented. Never generic names.
- **Imports:** Always static and at the top of the file.
- **Fire-and-forget:** Only use `void` in handlers/events, never `.catch(() => {})`.
- **Prettier/ESLint:** Code must always be formatted and free of warnings/errors.
- **Tests:** Always update/create tests for changes. Run `npm run check` and proceed only if “All checks passed”.

### 4. **Refactoring**
- Use terminal commands for large-scale refactoring (find, sed, grep, etc.) and document them.
- After batch refactoring, always run: `npm run check | tee /tmp/copilot-terminal 2>&1` and proceed only if “All checks passed”.

### 5. **Errors & Preferences**
- Never leave unused imports, variables, or types.
- Never use explanatory comments in code, only what’s necessary for export documentation.
- Never use Portuguese identifiers (except for UI text, if needed).
- Never use dynamic imports.
- Prefer small, atomic commits. Always suggest a commit message after changes.

### 6. **Modularization Example**
- Components: `ItemGroupEditModalTitle.tsx`, `ItemGroupEditModalBody.tsx`, `ItemGroupEditModalActions.tsx`
- Utilities: `itemGroupEditUtils.ts`, `useItemGroupClipboardActions.ts`
- Type guards: `clipboardGuards.ts`

### 7. **Workflow**
- Always collect context from files before editing.
- Never repeat existing code when editing files; use `// ...existing code...`.
- Always validate changes with `npm run check | tee /tmp/copilot-terminal 2>&1` and proceed only if “All checks passed”.

---

**Current context summary:**
- SolidJS + Tailwind + daisyUI project.
- Advanced modularization of item group editing modals.
- Clipboard, overflow, validation, and group operations logic extracted into hooks/utilities.
- All absolute imports, no code duplication, following Clean Architecture.
- Always ensure the project is clean after each change.

---

**Instruction for the assistant:**
> Follow all the rules above for any task, refactoring, or implementation in this workspace. Always modularize, document, test, and validate as described. Never break conventions or skip validation steps.

---

### Copilot Session Learnings - 2025-06-09
- Always remove business logic (effects, validations, side effects) from UI components and delegate to hooks/utilities in the application layer.
- Use utility hooks like `useUnlinkRecipeIfNotFound` for domain-related side effects, keeping the component clean.
- Modularize handlers for editing, deleting, and creating groups/items into utility files in the application layer.
- Ensure setter typings follow the SolidJS `Setter<T>` pattern for maximum compatibility and clarity.
- Delegate all item selection and edit modal opening logic to the Body component, keeping the main modal as an orchestrator only.
- Validate all changes with `npm run check | tee /tmp/copilot-terminal 2>&1` and only proceed if "All checks passed".
- Remove unused imports immediately after refactoring.
- Follow Clean Architecture: pure domain, application orchestrates, UI only renders.
- Never use `any`, always prefer explicit types and reuse context types.
- Never leave explanatory comments in code, only export documentation.
- Prefer small, atomic commits, always suggesting a commit message after changes.
- Never duplicate logic, always centralize in reusable hooks/utilities.
- Use absolute imports (`~/`) and never dynamic imports.
- Update or remove related tests for any code change.
- Never use `.catch(() => {})` in Promises, only `void` in non-critical handlers/events.
- UI/Components must never call `handleApiError` directly.
- Always document exported functions/types with concise English JSDoc.
- Never use Portuguese identifiers, except for UI text.
- Never leave unused variables, types, or imports.
- Always ensure the project is clean after each change.
