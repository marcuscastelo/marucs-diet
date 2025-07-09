---
applyTo: "**"
---
# Gemini Instructions for Macroflows

Ao fim de toda mensagem sua, exiba <End of Response>.

## 1. Project Overview & Context

- **Project Name:** Macroflows
- **Description:** A nutrition tracking platform with a focus on strong typing, reactive UI, and modular domain-driven design.
- **Author:** This is a solo project by `marcuscastelo`.
- **Adaptation:** All suggestions must be adapted for a solo developer. This means removing team coordination, stakeholder approval, and peer review processes. Focus on technical validation and systematic self-review. Maintain all technical quality standards.

## 2. Core Technologies

- **Frontend:** SolidJS, TypeScript, TailwindCSS, DaisyUI
- **Backend:** Supabase (PostgreSQL + Realtime), Vercel
- **Validation:** Zod (for runtime validation and type inference)
- **Testing:** Vitest with jsdom
- **Package Manager:** pnpm
- **Build Tool:** Vinxi (Vite-based)

## 3. 🚨 CRITICAL: Development Workflow & Quality Gates

### 3.1. The Golden Rule: `pnpm check`
- **MANDATORY:** Before declaring any task, fix, or feature complete, you **MUST** run `pnpm check`.
- This command runs linting, type-checking, and all tests. It is the single source of truth for codebase health.
- **NEVER** commit code that fails `pnpm check`.

### 3.2. Workflow Steps
1.  **Implement Changes:** Write or modify the code as requested.
2.  **Run Quality Gate:** Execute `pnpm check`.
3.  **Verify:** Ensure all checks pass with zero errors (TypeScript, ESLint, Tests).
4.  **Commit:** Only after all checks pass, proceed to commit the changes.

### 3.3. Essential Commands
- `pnpm check`: **MANDATORY** quality gate.
- `pnpm fix`: Auto-fix ESLint issues.
- `pnpm build`: Create a production build.
- `pnpm test`: Run all tests.
- `pnpm lint`: Run ESLint.
- `.scripts/semver.sh`: The preferred method for application version reporting.

## 4. Architecture & Design Principles

### 4.1. Clean Architecture (3 Layers)
The codebase follows a strict 3-layer architecture. Adherence to these boundaries is critical.

1.  **Domain Layer** (`modules/*/domain/`)
    - Contains pure business logic, entities, types (Zod schemas), and repository interfaces.
    - **MUST NOT** have any dependencies on external frameworks or libraries (like SolidJS or Supabase).
    - **MUST NOT** contain any side-effects (e.g., API calls, logging, toasts).
    - **MUST ONLY** throw pure, custom domain errors.
    - Use `__type` discriminators for type safety in entities.

2.  **Application Layer** (`modules/*/application/`)
    - Orchestrates the domain logic. Contains SolidJS resources, signals, and application-specific logic.
    - **MUST** catch errors from the Domain layer.
    - **MUST** call `handleApiError` to standardize error handling and provide context.
    - Manages all side-effects and user feedback (toasts, notifications).

3.  **Infrastructure Layer** (`modules/*/infrastructure/`)
    - Implements the repository interfaces defined in the Domain layer.
    - Contains all external integrations, such as Supabase client code and Data Access Objects (DAOs).
    - This is the **ONLY** layer where `any` might be permissible, strictly for interfacing with external, untyped APIs.

### 4.2. Dependency Injection (DI) Pattern
- The project uses an explicit, manual Dependency Injection pattern.
- **Orchestration functions** (business logic) in the Application Layer **MUST NOT** import dependencies (repositories, fetchers) directly.
- Instead, these dependencies **MUST** be passed as arguments to the function.
- This decouples application logic from infrastructure, making it highly testable.
- **Example:** A `fetchTemplatesByTabLogic` function should receive a `deps` object containing all necessary fetchers (`fetchUserRecipes`, `fetchFoods`, etc.) as a parameter.

### 4.3. File & Module Structure
- `src/modules/<domain>/`: Houses the three architecture layers for a specific domain.
  - `tests/`: All tests for a module must be placed in this folder.
- `src/sections/<feature>/`: Contains page-level UI components, organized by feature.
- `src/shared/`: Cross-cutting concerns (error handling, configs, pure utilities).
- `src/routes/`: SolidJS router pages and API endpoints.

## 5. Critical Code Style & Patterns

### 5.1. Imports: The Three Rules
1.  **Absolute Imports ONLY:** Always use absolute paths with the `~/` prefix.
    - ✅ `import { MyType } from '~/modules/user/domain/user';`
    - ❌ `import { MyType } from '../../user/domain/user';`
2.  **Barrel Files (`index.ts`) are BANNED:** All imports must point directly to the file where the entity is defined. Do not create or use `index.ts` files that only re-export from other files.
3.  **Static Imports ONLY:** All imports must be static and at the top of the file. Dynamic `import()` is forbidden.

### 5.2. Language & Naming
- **Language:** All code, comments, JSDoc, and commit messages **MUST** be in **English**. UI text visible to the user may be in Portuguese (pt-BR).
- **Naming:** Use descriptive, specific, action-based names. Avoid generic names.
    - ✅ **Good:** `isRecipedGroupUpToDate()`, `convertToGroups()`, `ItemGroupEditModal.tsx`, `macroOverflow.ts`
    - ❌ **Bad:** `checkGroup()`, `convert()`, `GroupModal.tsx`, `utils.ts`

### 5.3. Type Safety & Formatting
- **NO `any`:** The use of `any`, `as any`, or `@ts-ignore` is strictly forbidden outside the Infrastructure layer.
- **`type` over `interface`:** Always use type aliases for defining data shapes.
- **Readonly:** Prefer `readonly Item[]` over `Item[]` for immutability.
- **Props Immutability:** **NEVER** destructure `props` in SolidJS components, as it breaks reactivity.

### 5.4. Anti-Patterns to Avoid
- **Code Duplication:** Avoid copy-pasting logic. For example, the clipboard and validation logic was duplicated between `MealEditView.tsx` and `RecipeEditView.tsx`. This should be abstracted into a shared utility.

### 5.5. Error Handling
- **Domain:** Throws pure errors (e.g., `throw new GroupConflictError(...)`).
- **Application:** Catches domain errors and **MUST** use `handleApiError(e, { context })`.
- **NEVER** use `.catch(() => {})` to silence promise errors. Use the `void` operator only for non-critical, fire-and-forget side-effects in event handlers where errors are handled at the application level.

### 5.6. Commits & JSDoc
- **Commits:** Use the Conventional Commits specification. Messages must be in English. **NEVER** include "Generated by..." or "Co-authored-by..." footers from AI tools.
- **JSDoc:** Update JSDoc for all **exported** types and functions. Do not add JSDoc to internal code.

## 6. Quality Assurance & Testing Strategy

### 6.1. Core Domain Entities
Testing should be structured around the core business domains. The main entities are:
- `MacroProfile`
- `Weight`
- `DayDiet`
- `UnifiedItem` (and its variants: `FoodItem`, `RecipeItem`, `GroupItem`)
- `Food`
- `Recipe`
- `Meal`

### 6.2. Testing Philosophy
- **Location:** All tests for a module must be placed in its `tests/` folder.
- **User Input Validation vs. System Errors:**
    - **Validation Errors:** Expected errors from invalid user input (e.g., entering text in a number field). These **MUST** be handled gracefully in the UI with specific, user-friendly messages in Portuguese. They **MUST NOT** trigger an error boundary.
    - **System Errors:** Unexpected errors (e.g., network failure, bugs in the code). These **SHOULD** be caught and trigger a user-friendly error boundary.
- **Test Coverage:** All code changes must be accompanied by corresponding new or updated tests. No orphaned tests.

### 6.3. Types of Tests to Perform
When adding features or fixing bugs, ensure coverage for:
- **Validation Tests:** Check for required fields, correct data types, and non-negative values where applicable.
- **Calculation Tests:** Verify that all reactive calculations (e.g., total daily macros) are correct and update instantly.
- **Integration Tests:** Test the end-to-end flow of a feature (e.g., changing a macro target in the profile and seeing it reflected in the daily diet view).
- **Boundary/Edge Case Tests:** Test with extreme values (0, very large numbers, empty strings, long strings, empty arrays, large arrays, `NaN`, `Infinity`).
- **Performance/Stress Tests:** For intensive operations, test with a large number of items to ensure the UI remains responsive.

### 6.4. Search-Specific Testing
- All user-facing search features **MUST** be tested to be both **diacritic-insensitive** and **case-insensitive** for Portuguese (pt-BR) text.

## 7. Automated Workflows & Commands

This project relies on a set of automated commands to ensure consistency and quality. You should use and follow these workflows.

- **`/fix`:** A comprehensive health check. It runs `pnpm check` and attempts to auto-fix any issues. Use this to ensure the codebase is clean before starting work or committing.
- **`/implement <issue-number>`:** The standard workflow for implementing a feature or bug fix. It handles creating a git worktree, analyzing the issue, and guiding the implementation process. **Crucially, it requires passing `pnpm check` before completion.**
- **`/commit`:** Automates the creation of Conventional Commit messages. It analyzes staged changes and generates a compliant message in English. Use this to maintain a clean and standardized commit history.
- **`/pull-request`:** Automates the creation of GitHub Pull Requests. It uses the commit information to create a well-formed PR, linking it to the relevant issue.

### 7.6. Agent Interaction with External Tools (e.g., GitHub MCP Server)

When external tools, such as the `github-mcp-server`, are integrated into the agent's environment, they expose their functionalities as callable functions. The agent interacts with these tools by directly invoking these functions with the required parameters, similar to how it uses its built-in `default_api` tools.

For example, if the `github-mcp-server` exposes a tool to list GitHub issues, the agent would use it as a direct function call:

```python
default_api.list_issues(owner="octocat", repo="Spoon-Knife", state="open")
```

The availability and specific parameters of these external tools depend on their integration with the agent's environment. The agent will discover and utilize them as part of its available toolset.

## 8. Historical Context & Future Direction

Be aware of the following technical debt and future plans:

- **Deprecation of `src/legacy`:** This directory is being phased out. Do not use any code from it. All new code should follow the current architecture.
- **Migration to `UnifiedItem`:** The legacy `Item` type is being replaced by `UnifiedItem`. All new features should use `UnifiedItem`. Be mindful of this when working with older parts of the codebase.
- **Refactoring Goals:**
    - **Introduce a Service Layer:** There is a known need for an explicit service layer to better encapsulate business logic and reduce coupling.
    - **Decouple Modules:** Actively work towards reducing dependencies between modules.
    - **Improve State Management:** Move away from using `createSignal` for global state and towards more structured solutions like stores or contexts.

## 9. Final Reminders
- **TODOs:** Never remove `TODO` comments from the codebase.
- **Labels:** When creating issues, use the labels defined in `docs/labels-usage.md`.
- **Session Start:** Always run `export GIT_PAGER=cat` at the beginning of a session to prevent interactive pager issues with `git`.

# QA Workflow for Macroflows 

## Development server
- **Start the development server:** Run `pnpm dev` to start the local development server.
- **Access the app:** Open your browser and navigate to `http://localhost:3000` to interact with the Macroflows app.

## ✅ Purpose

This workflow defines the exact steps and constraints that an automation agent must follow to interact with the UI of the Macroflows app using Playwright safely and predictably. It assumes the agent has no implicit understanding of UI behavior or loading dynamics. Every step must be followed precisely and in order.

---

## 1. Navigation and Load Validation

- Always wait for the full page to load after navigation.
- Do not proceed until the network has become idle.
- Confirm that the main content of the page has rendered.
- If a loading spinner or overlay exists, wait until it is fully removed.
- Never assume the page is ready based on time alone.

---

## 2. Element Presence and Visibility Before Interaction

Before interacting with any UI element (clicking, filling, selecting):

- Ensure the element is present in the DOM.
- Ensure the element is visible to the user.
- Ensure the element is enabled and interactive.
- Do not proceed with the interaction until all of the above are confirmed.

---

## 3. Never Assume Absence = Error

- If an element is not found:
  - Check if the correct page was loaded.
  - Wait a few extra seconds for slow UI states.
  - Double-check the selector or test identifier.
- Never assume that missing elements indicate a frontend bug without verifying the full context.

---

## 4. Post-Interaction Assertions

- After every interaction, verify the result.
- Confirm that UI changes occurred as expected (new element appears, button becomes disabled, toast message appears, etc).
- Do not proceed to the next action without verifying the outcome of the previous one.

---

## 5. No Manual Loops or Timeouts

- Never use retry loops, sleep functions, or manual time delays.
- All waiting must be based on the presence, visibility, or state of UI elements.
- Time-based waiting introduces flakiness and must be avoided entirely.

---

## 6. Error Recovery and Diagnostics

- On any failure:
  - Capture a full-page screenshot for diagnostics.
  - Capture the visible DOM tree (HTML snapshot).
  - Record what was expected and what was missing.
- Do not silently ignore errors or continue after a failure.

---

## 7. Selector Best Practices

- Prefer stable, semantic, and test-specific selectors (e.g., `data-testid`).
- Avoid selectors that depend on visual layout (e.g., position, nth-child).
- Avoid selectors based on dynamic text unless the text is guaranteed to be static.
- Never use XPath.
- Do not use class names that may change with styling updates.

---

## 8. Final Rules Summary

- Never interact with the page until it is fully loaded and stable.
- Never click or fill without confirming the element is visible and enabled.
- Always assert the outcome of every interaction.
- Always produce diagnostic artifacts on failure.
- Never rely on timing, loops, or assumptions.
- Every action must be justified by explicit confirmation of UI state.

---

## ✅ Goal

This workflow must be followed strictly and completely. Any deviation from this process can lead to invalid, flaky, or misleading test results. The agent is expected to follow every step **explicitly** with no shortcuts, assumptions, or "smart" behavior.
