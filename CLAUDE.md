# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Macroflows is a nutrition tracking platform built with SolidJS, TypeScript, and Supabase. It follows domain-driven design principles with a layered architecture and emphasizes type safety, reactive programming, and modular organization.

**Project Context:** This is a solo project by marcuscastelo - adapt all suggestions to remove team coordination/approval processes while maintaining technical quality.

## Critical Setup Requirements

**Before Starting Any Session:**
```bash
export GIT_PAGER=cat
```
This disables pagers for git/gh commands, preventing interactive output issues.

**Environment Setup:**
- Copy `.env.example` to `.env.local` and configure Supabase credentials
- Verify `.scripts/` directory exists with required helper scripts
- Use pnpm as package manager (version 10.12.1+)

## Development Commands

**Essential Commands:**
- `pnpm dev` - Start development server (runs gen-app-version first)
- `pnpm build` - Production build (runs gen-app-version first)
- `pnpm test` - Run all tests with Vitest
- `pnpm type-check` - TypeScript type checking
- `pnpm lint` - ESLint checking (quiet mode)
- `pnpm fix` - Auto-fix ESLint issues
- `pnpm flint` - Fix then lint (fix + lint)
- `pnpm check` - Run all quality checks (lint, type-check, test)
- `pnpm copilot:check` - Comprehensive check with success confirmation

**Script Utilities:**
- `.scripts/semver.sh` - App version reporting (preferred over git describe)
- `.scripts/gen-app-version.sh` - Generate app version (auto-run with dev/build)
- `.scripts/cat1.sh`, `.scripts/cat2.sh`, `.scripts/cat3.sh` - Terminal output helpers

**Testing:**
- Tests use Vitest with jsdom environment
- Run single test file: `pnpm test <file-pattern>`
- Coverage: `pnpm test --coverage`
- Tests must be updated when changing code - no orphaned tests

## Claude Commands

**Optimized commands available in `.claude/commands/` directory:**

### Workflow Commands
- `/commit` - Generate conventional commit messages and execute commits
- `/pull-request` or `/pr` - Create pull requests with proper formatting

### Quality Assurance
- `/fix` - Automated codebase checks and error correction
- `/review` - Comprehensive code review for PR changes

### Issue Management
- `/create-issue [type]` - Create GitHub issues using proper templates
- `/implement <issue-number>` - Autonomous issue implementation

### Refactoring
- `/refactor [target]` - Clean architecture refactoring and modularization

### Session Management
- `/end-session` or `/end` - Session summary and knowledge export

**Daily Workflow Example:**
```bash
/fix                    # Ensure clean codebase
/create-issue feature   # Create feature request
/implement 123          # Implement issue #123
/commit                # Generate and execute commit
/pull-request          # Create PR for review
```

See `.claude/commands/README.md` for complete command documentation.

## Architecture Overview

### Layered Domain-Driven Architecture

The codebase follows a strict 3-layer architecture pattern with clean separation of concerns:

**Domain Layer** (`modules/*/domain/`):
- Pure business logic, types, and repository interfaces
- Uses Zod schemas for validation and type inference
- Entities have `__type` discriminators for type safety
- **NEVER** import or use side-effect utilities (handleApiError, logging, toasts)
- Only throw pure domain errors with context
- **CRITICAL:** Domain layer must remain free of framework dependencies

**Application Layer** (`modules/*/application/`):
- SolidJS resources, signals, and orchestration logic
- **Must always catch domain errors and call `handleApiError` with full context**
- Manages global reactive state using `createSignal`/`createEffect`
- Coordinates between UI and infrastructure layers
- Handles all side effects and user feedback (toasts, notifications)

**Infrastructure Layer** (`modules/*/infrastructure/`):
- Supabase repositories implementing domain interfaces
- DAOs for data transformation and legacy migration
- External API integrations and data access
- Only layer allowed to use `any` types when necessary for external APIs

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

**Critical Rule:** All application code must use `handleApiError` with context - never log/throw errors without it.

**Domain Layer:**
```typescript
// ✅ Good: Pure domain error with context
throw new GroupConflictError('Group mismatch', { groupId, recipeId })

// ❌ Bad: Never use handleApiError in domain
import { handleApiError } from '~/shared/error/errorHandler'
handleApiError(...) // Strictly forbidden in domain layer
```

**Application Layer:**
```typescript
// ✅ Required pattern: Always catch and contextualize
try {
  domainOperation()
} catch (e) {
  handleApiError(e, {
    component: 'ComponentName',
    operation: 'operationName', 
    additionalData: { userId }
  })
  throw e // Re-throw after logging
}
```

**Error Context Requirements:**
- `component`: Specific component/module name
- `operation`: Specific operation being performed
- `additionalData`: Relevant IDs, state, or debugging info

## Component and Promise Patterns

### Fire-and-Forget Promises

**When to Use `void` Operator:**
- **Only in event handlers** (onClick, onChange) where result is not needed
- **Only when** all error handling is done in application layer
- **Only for non-critical side effects** (background refresh, logging)

```tsx
// ✅ Acceptable: Error handling in application layer
<button onClick={() => void performAction()}>
  Create Day
</button>

// ❌ Never use .catch(() => {}) to silence errors
<button onClick={() => performAction().catch(() => {})}>
```

**Fire-and-Forget Checklist:**
- [ ] Promise result not needed for user flow
- [ ] All error handling done in application layer
- [ ] Limited to event handlers or non-critical callbacks
- [ ] Reason for `void` is documented if not obvious

### Component Patterns

**Compound Components:**
```typescript
Modal.Header = ModalHeader
Modal.Content = ModalContent
Modal.Footer = ModalFooter
```

**Conditional Actions with Type Safety:**
```typescript
const hasAnyHandler = () => 
  getHandlers().onEdit || getHandlers().onCopy || getHandlers().onDelete

<Show when={hasAnyHandler()}>
  <ActionsMenu />
</Show>
```

**Context Propagation:**
- **Prefer global signals** over prop drilling for shared state
- Use SolidJS context for scoped state (modals, forms)
- Leverage reactive patterns with `createEffect` for state synchronization

## Testing Guidelines

- Place tests in module's `tests/` folder or alongside source files with `.test.ts` suffix
- Use Vitest + jsdom for component testing
- Mock dependencies explicitly for domain/application logic
- Update tests when changing code - no orphaned tests

## Critical Code Style Rules

### Imports and Module System

**Absolute Import Requirement:**
```typescript
// ✅ Required: Always use absolute imports with ~/ prefix
import { handleApiError } from '~/shared/error/errorHandler'
import { DayDiet } from '~/modules/diet/day-diet/domain/dayDiet'

// ❌ Forbidden: Relative imports
import { handleApiError } from '../../../shared/error/errorHandler'
import { DayDiet } from './domain/dayDiet'
```

**Barrel File Ban:**
- **STRICTLY FORBIDDEN:** No `index.ts` barrel files that re-export modules
- All imports must be direct from specific files
- Never import from directory indices

**Static Import Requirement:**
```typescript
// ✅ Required: Static imports at top of file
import { Component } from 'solid-js'

// ❌ Forbidden: Dynamic imports
const { Component } = await import('solid-js')
```

### Language Policy
- **All code, comments, JSDoc, and commit messages in English**
- **UI text only may be in Portuguese (pt-BR) when required**
- When refactoring, convert any non-English comments to English
- **Never use Portuguese for identifiers, variables, functions, or comments**

### Naming Conventions
- **Descriptive, action-based names:** `isRecipedGroupUpToDate()` not `checkGroup()`
- **Specific file names:** `macroOverflow.ts` not `utils.ts`
- **Complete component names:** `ItemGroupEditModal` not `GroupModal`
- **Avoid generic names:** Never use `utils.ts`, `helper.ts`, `common.ts`

### Type Safety Requirements
- **Never use `any`, `as any`, or `@ts-ignore`** (except in infrastructure layer for external APIs)
- **Always prefer type aliases over interfaces** for data shapes
- **Use Zod schemas for runtime validation and type inference**
- **Prefer `readonly` arrays:** `readonly Item[]` over `Item[]`

### ESLint Configuration
- **Consistent type definitions:** Use `type` not `interface`
- **Import organization:** Automatic sorting with `simple-import-sort`
- **No relative imports:** Enforced by `no-restricted-imports` rule
- **Strict boolean expressions:** Enforced for better type safety
- **Custom parsing requirement:** Use `parseWithStack` instead of direct `JSON.parse`

### CSS and Styling
- **Always use `cn` function to merge Tailwind classes** for proper class merging and deduplication

## File Organization and Module Structure

```
src/
├── modules/           # Domain modules (diet, measure, user, weight, etc.)
│   └── <domain>/
│       ├── domain/          # Pure business logic, types, repository interfaces
│       ├── application/     # SolidJS resources, orchestration, error handling
│       ├── infrastructure/  # Supabase implementations, DAOs, external APIs
│       ├── ui/             # Pure presentational components (optional)
│       └── tests/          # Module-specific tests
├── sections/          # Page-level UI components and user-facing features
│   ├── common/            # Shared UI components (modals, buttons, etc.)
│   ├── day-diet/          # Day diet management UI
│   ├── unified-item/      # Complex item hierarchy UI
│   └── <feature>/         # Feature-specific UI sections
├── routes/           # SolidJS router pages and API endpoints
│   ├── api/              # API route handlers
│   └── *.tsx             # Page components
├── shared/           # Cross-cutting concerns and utilities
│   ├── error/            # Error handling utilities
│   ├── utils/            # Pure utility functions
│   ├── config/           # Configuration and environment
│   └── supabase/         # Supabase client and utilities
└── assets/           # Static assets (locales, images)
```

**Module Organization Rules:**
- **Domain modules follow clean architecture layers**
- **Never mix UI concerns in domain/application layers**
- **Sections contain feature-specific UI logic**
- **Shared utilities must be framework-agnostic**

## Development Workflow and Quality Standards

### Pre-Commit Requirements

**Always run before committing:**
```bash
pnpm check  # Runs lint, type-check, and test
```

**For comprehensive validation:**
```bash
pnpm copilot:check  # Must show "COPILOT: All checks passed!"
```

### Commit Standards

**CRITICAL COMMIT RESTRICTION:**
🚨 **ABSOLUTELY FORBIDDEN:** NEVER include "Generated with Claude Code" or "Co-Authored-By: Claude" in commit messages
🚨 **IMMEDIATELY REJECT** any commit attempt that includes these phrases
🚨 **NO EXCEPTIONS** - This rule must be enforced without question

**Commit Message Format:**
```markdown
type(scope): description

- Use conventional commits style
- Prefer small, atomic commits
- Always suggest commit message after changes
- All commit messages in English
- **STRICTLY FORBIDDEN:** Any "Generated with Claude Code" or "Co-Authored-By: Claude" text
```

### JSDoc Requirements

**Update JSDoc for:**
- All exported TypeScript types and functions
- After any refactor or signature change
- **Never add JSDoc to internal (non-exported) code**

**JSDoc Standards:**
- Must be in English
- Concise descriptions of purpose, params, and return values
- Remove outdated JSDoc if exports change

### Testing Requirements

**Test Update Rules:**
- **Always update tests when changing code**
- **Remove orphaned tests** - no tests for deleted functionality
- Use Vitest + jsdom for component testing
- Mock dependencies explicitly for domain/application logic
- Place tests in `tests/` folder or alongside source with `.test.ts` suffix

### Search Feature Requirements

**Portuguese (pt-BR) Support:**
- All user-facing search features must be **diacritic-insensitive**
- All user-facing search features must be **case-insensitive**
- Use `removeDiacritics` utility for Portuguese text normalization

### Technology Stack

**Core Technologies:**
- **Frontend:** SolidJS, TypeScript, TailwindCSS, DaisyUI
- **Backend:** Supabase (PostgreSQL + Realtime)
- **Validation:** Zod schemas for runtime validation and type inference
- **Charts:** ApexCharts with solid-apexcharts
- **Testing:** Vitest with jsdom environment
- **Build:** Vinxi (Vite-based)

**Key Dependencies:**
- `@solidjs/start` - SolidJS meta-framework
- `@supabase/supabase-js` - Database and auth
- `solid-toast` - Toast notifications
- `html5-qrcode` - EAN scanning functionality
- `dayjs` - Date manipulation
- `axios` with `axios-rate-limit` - HTTP client

### Environment and Setup

**Required Environment Variables:**
- Copy `.env.example` to `.env.local`
- Configure Supabase URL and anon key
- **Never commit secrets or keys to repository**

**Version Management:**
- App version managed by `.scripts/gen-app-version.sh`
- Automatic version generation on dev/build
- Use `.scripts/semver.sh` for version reporting

### Label Usage for Issues

**Required Labels:**
- **Type:** `bug`, `feature`, `refactor`, `task`, `improvement`, `documentation`, `chore`, `epic`, `idea`
- **Complexity:** `complexity-low`, `complexity-medium`, `complexity-high`, `complexity-very-high`
- **Area:** `ui`, `backend`, `api`, `performance`, `data-consumption`, `accessibility`
- **Status:** `blocked`, `needs-investigation`, `needs-design`

**Label Rules:**
- Always add at least one main type label
- Remove generic labels after classification
- No duplicate or conflicting labels
- Refer to `docs/labels-usage.md` for complete reference

### Never Remove TODOs

**Critical Rule:** Never remove TODO comments from codebase, regardless of context. TODOs serve as important markers for future improvements and technical debt.

### Solo Project Adaptations

**Since this is a solo project:**
- Remove team collaboration and approval processes from suggestions
- Focus on technical validation rather than stakeholder approval
- Maintain quality standards without bureaucratic overhead
- Replace peer review with systematic self-review processes
- Preserve backup/rollback procedures without team communication

## Memory Bank

- **NEVER destucture `props`! This breaks reactivity**