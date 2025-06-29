# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Marucs Diet is a nutrition tracking platform built with SolidJS, TypeScript, and Supabase. It follows domain-driven design principles with a layered architecture and emphasizes type safety, reactive programming, and modular organization.

## Development Commands

**Essential Commands:**
- `pnpm dev` - Start development server (runs gen-app-version first)
- `pnpm build` - Production build (runs gen-app-version first)
- `pnpm test` - Run all tests with Vitest
- `pnpm type-check` - TypeScript type checking
- `pnpm lint` - ESLint checking (quiet mode)
- `pnpm fix` - Auto-fix ESLint issues
- `pnpm flint` - Fix then lint
- `pnpm check` - Run all checks (lint, type-check, test)

**Testing:**
- Tests use Vitest with jsdom environment
- Run single test file: `pnpm test <file-pattern>`
- Coverage: `pnpm test --coverage`

## Architecture Overview

### Layered Domain-Driven Architecture

The codebase follows a strict 3-layer architecture pattern:

**Domain Layer** (`modules/*/domain/`):
- Pure business logic, types, and repository interfaces
- Uses Zod schemas for validation and type inference
- Entities have `__type` discriminators for type safety
- **NEVER** import or use side-effect utilities (handleApiError, logging, toasts)
- Only throw pure domain errors

**Application Layer** (`modules/*/application/`):
- SolidJS resources, signals, and orchestration logic
- Handles error catching from domain and calls `handleApiError` with context
- Manages global reactive state and side effects
- Coordinates between UI and infrastructure

**Infrastructure Layer** (`modules/*/infrastructure/`):
- Supabase repositories implementing domain interfaces
- DAOs for data transformation and migration
- External API integrations

### State Management

**Global Reactive State:**
```typescript
export const [items, setItems] = createSignal<readonly Item[]>([])
```

**Effects for Synchronization:**
```typescript
createEffect(() => {
  // Reactive updates based on signals
})
```

**Context Pattern:** Used for modals, confirmations, and scoped state

### Key Domain Patterns

**Unified Item Hierarchy:** Complex discriminated union types with recursive schemas
```typescript
export type UnifiedItem = FoodItem | RecipeItem | GroupItem
```

**Repository Pattern:** Interface-based contracts with Supabase implementations

**Migration Utilities:** Backward compatibility for evolving data schemas

## Error Handling Standards

**Domain Layer:**
```typescript
// Good: Pure domain error
throw new GroupConflictError('Group mismatch', { groupId, recipeId })

// Bad: Never use handleApiError in domain
import { handleApiError } from '~/shared/error/errorHandler' // ❌
```

**Application Layer:**
```typescript
try {
  domainOperation()
} catch (e) {
  handleApiError(e, {
    component: 'ComponentName',
    operation: 'operationName',
    additionalData: { userId }
  })
  throw e
}
```

## Component Patterns

**Fire-and-Forget Promises:**
Use `void` operator in event handlers when the result is not needed and all error handling is done in application layer:
```tsx
<button onClick={() => void performAction()}>
```

**Compound Components:**
```typescript
Modal.Header = ModalHeader
Modal.Content = ModalContent
```

**Conditional Actions:**
```typescript
const hasHandlers = () => getHandlers().onEdit || getHandlers().onCopy
```

## Testing Guidelines

- Place tests in module's `tests/` folder or alongside source files with `.test.ts` suffix
- Use Vitest + jsdom for component testing
- Mock dependencies explicitly for domain/application logic
- Update tests when changing code - no orphaned tests

## Code Style Rules

**Language Policy:**
- All code, comments, and commit messages in English
- UI text may be in Portuguese (pt-BR) when required

**Naming Conventions:**
- Descriptive, action-based function names: `isRecipedGroupUpToDate()` not `checkGroup()`
- Specific file names: `macroOverflow.ts` not `utils.ts`
- Complete component names: `ItemGroupEditModal` not `GroupModal`

**Type Safety:**
- Never use `any`, `as any`, or `@ts-ignore` (except in infrastructure layer)
- Always prefer type aliases over interfaces for data shapes
- Use Zod schemas for runtime validation

**Dependencies:**
- Use pnpm as package manager
- Check existing dependencies before adding new ones
- Follow project's established library choices (SolidJS, Supabase, Tailwind, etc.)

## File Organization

```
src/
├── modules/           # Domain modules (diet, measure, user, etc.)
│   └── <domain>/
│       ├── domain/          # Types, entities, interfaces
│       ├── application/     # SolidJS resources, orchestration
│       ├── infrastructure/  # Supabase, DAOs, external APIs
│       └── ui/             # Pure presentational components
├── sections/          # Page-level UI components and features
├── routes/           # SolidJS router pages
└── shared/           # Common utilities and cross-cutting concerns
```

## Important Notes

- Always run `pnpm check` before committing to ensure code quality
- Use descriptive commit messages and prefer atomic commits
- Update JSDoc for exported functions after signature changes
- Never use dynamic imports - always static imports at the top
- The app uses Supabase for backend with real-time subscriptions
- Environment variables required - copy `.env.example` to `.env.local`