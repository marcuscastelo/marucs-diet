# Commit Guidelines Prompt

You are writing a commit message for this project. Follow **strictly** the extended Conventional Commits specification defined below.

## ✅ Types

| Type       | Use for...                                                         |
|------------|---------------------------------------------------------------------|
| `feat`     | New features, endpoints, or UI components                           |
| `fix`      | Bug fixes or regressions                                            |
| `refactor` | Internal code changes that don’t affect behavior                    |
| `style`    | Formatting, whitespace, comments (no logic change)                 |
| `docs`     | Documentation only (README, inline docs, etc)                      |
| `test`     | Adding or modifying tests                                           |
| `build`    | Build scripts, Dockerfile, Makefile, packaging                      |
| `ci`       | Continuous integration configs and pipelines (GitHub Actions, etc) |
| `chore`    | Dependency bumps, configs, minor tooling not affecting runtime      |
| `revert`   | Reverts of previous commits                                         |

## 🧪 Scope conventions

- Use **a specific scope** in parentheses: `fix(auth): ...`
- For UI-related commits, use `-ui` in the scope: `feat(profile-ui): ...`
- For multiple scopes, separate with commas: `fix(meal,day-diet): ...`
- Scopes should match modules or domain boundaries.

## 💡 Commit message rules

- **Subject** must:
  - Be in **technical English**
  - Be **specific** and **concise**
  - Avoid generic words like `update`, `change`, `fix bug`, `wip`, etc.
- Use `!` after the type for **breaking changes**, and explain them in the body.
- Optional **body** (after a blank line):
  - Must be in **technical English**
  - Should explain *why* the change was made (context or reason)
  - Should not restate the subject

## ✅ Examples

