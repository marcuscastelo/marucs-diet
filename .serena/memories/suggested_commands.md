# Suggested Commands for Macroflows Development

## Essential Development Commands
```bash
# Start development server
pnpm dev

# Quality gate (MANDATORY before completion)
pnpm check

# Fix ESLint issues automatically
pnpm fix

# Production build
pnpm build

# Type checking
pnpm type-check

# Run tests
pnpm test

# Run single test file
pnpm test <file-pattern>

# Test with coverage
pnpm test --coverage

# Generate app version
pnpm gen-app-version
```

## System Commands (Linux)
```bash
# Basic file operations
ls -la
cd <directory>
find . -name "*.ts" -type f
grep -r "pattern" src/
tree -I node_modules

# Git operations
git status
git add .
git commit -m "message"
git push origin <branch>
git branch -a
git checkout <branch>
```

## Claude Commands (from .claude/commands/)
```bash
# Quality and fixes
/fix                    # Automated codebase checks
/review                # Code review for PR changes

# Issue management
/create-issue feature   # Create feature issue
/implement 123          # Implement issue #123

# Git workflow
/commit                # Generate and execute commit
/pull-request          # Create PR

# Refactoring
/refactor <target>     # Clean architecture refactoring

# Session management
/end-session           # Session summary
```

## Debugging Commands
```bash
# Check TypeScript errors
pnpm type-check

# Check ESLint errors
pnpm lint

# Run specific test
pnpm test src/modules/diet/day-diet/domain/dayDietOperations.test.ts

# Build and check for errors
pnpm build
```

## Environment Setup
```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Check pnpm version
pnpm --version
```