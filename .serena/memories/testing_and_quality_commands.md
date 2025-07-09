# Testing and Quality Commands

## 🚨 MANDATORY Quality Gate
**CRITICAL REQUIREMENT: ALWAYS RUN `pnpm check` BEFORE DECLARING ANY TASK COMPLETE**

## Essential Commands
- `pnpm check` - **MANDATORY** quality gate (lint, type-check, test) - MUST PASS before any completion
- `pnpm fix` - Auto-fix ESLint issues
- `pnpm flint` - Fix then lint (fix + lint)

## Granular Commands
- `pnpm build` - Production build (runs gen-app-version first)
- `pnpm type-check` - TypeScript type checking
- `pnpm test` - Run all tests with Vitest
- `pnpm lint` - ESLint checking (quiet mode)

## Development Commands
- `pnpm dev` - Start development server
- `pnpm gen-app-version` - Generate app version from git

## Testing Framework
- **Testing Library**: Vitest v3.2.2 with jsdom environment
- **Test Location**: Module `tests/` folder or alongside source with `.test.ts` suffix
- **Coverage**: `pnpm test --coverage`
- **Single Test**: `pnpm test <file-pattern>`

## Testing Requirements
- **Always update tests when changing code**
- **Remove orphaned tests** - no tests for deleted functionality
- Mock dependencies explicitly for domain/application logic
- Tests must pass before any task completion

## Pre-Commit Requirements
**⛔ CRITICAL RULE: NEVER declare any implementation, fix, or feature "complete" without:**
1. Running `pnpm check` and verifying ALL checks pass
2. Confirming NO TypeScript errors
3. Confirming NO ESLint errors
4. Confirming ALL tests pass
5. Only then can you say "✅ COMPLETE"

## Comprehensive Validation
- `pnpm copilot:check` - Must show "COPILOT: All checks passed!" for full validation