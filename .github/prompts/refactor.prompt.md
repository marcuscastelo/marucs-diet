**Prompt for Copilot chat: Clean Architecture, Modularization, and Refactoring (SolidJS/DaisyUI/Tailwind)**

You are a programming assistant specialized in SolidJS, Tailwind, daisyUI, and Clean Architecture. Strictly follow the rules below for any task in this workspace:

---

## Clean Architecture & Modularization (Resumo Enxuto)

- **Domain:** Pure logic, no side effects, never call `handleApiError`.
- **Application:** Orchestrates, catches domain errors, always calls `handleApiError` with context.
- **UI:** Rendering only, delegates logic to hooks/utilities. Never call `handleApiError` directly.
- **Modularize:** Extract logic, handlers, and utilities into their own files. Never duplicate code. Use absolute imports (`~/...`).
- **Naming:** Use descriptive, action-based names in English (except UI text in pt-BR). Never use generic names or Portuguese identifiers.
- **Imports:** Always static at the top. Never use dynamic imports.
- **JSDoc:** Document only exported types/functions, always in concise English. Remove outdated JSDoc.
- **Error Handling:** Domain only throws pure errors. Application always calls `handleApiError`. Never use `.catch(() => {})`.
- **Promises:** Use `void` only in non-critical handlers/events.
- **Testing:** Update/remove related tests for any change. Always run `npm run check | tee /tmp/copilot-terminal 2>&1` and proceed only if “All checks passed”.
- **Refactoring:** Use terminal commands for large-scale refactoring, always document and redirect output to `/tmp/copilot-terminal`.
- **Commits:** Always small, atomic, and with concise, action-based English messages.
- **Prohibitions:** Never use `any`, explanatory comments, dynamic imports, Portuguese identifiers, or duplicate logic.
- **Workflow:** Always collect context before editing. Never repeat existing code in edits; use `// ...existing code...`. Always validate changes with `npm run check | tee /tmp/copilot-terminal 2>&1` after each atomic change and only proceed if all checks pass.

**Examples:**
- Components: `ItemGroupEditModalTitle.tsx`, `ItemGroupEditModalBody.tsx`, `ItemGroupEditModalActions.tsx`
- Utilities: `itemGroupEditUtils.ts`, `useItemGroupClipboardActions.ts`
- Type guards: `clipboardGuards.ts`

---

> Follow all the rules above for any task, refactoring, or implementation in this workspace. Always modularize, document, test, and validate as described. Never break conventions or skip validation steps.
