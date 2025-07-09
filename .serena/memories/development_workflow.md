# Development Workflow

## Daily Workflow Commands
The project includes optimized Claude commands in `.claude/commands/` directory:

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

## Example Daily Workflow
```bash
/fix                    # Ensure clean codebase
/create-issue feature   # Create feature request
/implement 123          # Implement issue #123
/commit                # Generate and execute commit
/pull-request          # Create PR for review
```

## Git Workflow
- **Main branch**: `stable` (used for PRs)
- **Current branch**: `marcuscastelo/issue730-v2`
- **Solo project**: Remove team coordination/approval processes while maintaining quality

## Environment Setup
- **Package Manager**: pnpm v10.12.1 (REQUIRED)
- **Environment File**: Copy `.env.example` to `.env.local`
- **Never commit secrets** or keys to repository

## Commit Standards
- Use conventional commits style
- Prefer small, atomic commits
- All commit messages in English
- **STRICTLY FORBIDDEN**: Any "Generated with Claude Code" or "Co-Authored-By: Claude" text

## Branch Management
- Feature branches for new development
- Clean history with meaningful commits
- Squash merge for feature completion