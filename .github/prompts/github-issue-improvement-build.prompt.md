---
description: 'Generate a GitHub improvement/build issue from a build warning, inefficiency, or technical debt, using the improvement templates and best practices. Reference docs/issue-improvement-*.md for examples.'
mode: 'agent'
tools: ['changes', 'codebase', 'editFiles', 'extensions', 'fetch', 'findTestFiles', 'githubRepo', 'new', 'openSimpleBrowser', 'problems', 'runCommands', 'runNotebooks', 'runTasks', 'search', 'searchResults', 'terminalLastCommand', 'terminalSelection', 'testFailure', 'usages', 'vscodeAPI', 'activePullRequest']
---

# GitHub Issue: Improvement/Build

AGENT HAS CHANGED, NEW AGENT: .github/prompts/github-issue-improvement-build.prompt.md

When provided with a build warning, inefficiency, technical debt, or improvement suggestion related to the build process, generate a GitHub issue using the GitHub CLI (`gh`) as follows:

## Instructions

- **Title**: Write a concise, action-oriented title describing the improvement or build concern.
- **Body**: Use the structure and best practices from the improvement issues in `docs/issue-improvement-*.md`:
  - Justification: Why this improvement matters (impact, urgency, developer/user experience).
  - Urgency: Low/Medium/High, with a brief rationale.
  - Description: Summarize the warning, inefficiency, or technical debt, including example log output if available.
  - Impact: List the effects on build, performance, or maintainability.
  - Suggested Actions: List concrete next steps or mitigations.
  - Labels: Suggest at least one main type label (e.g., `improvement`, `build`), plus complexity and area labels as appropriate.
- **Formatting**: All issue bodies must use Markdown for all sections, lists, and headings.
- **Command**: Use `printf` with `\n` for newlines. Write the body to a temp file using `printf` with output redirection (`>`), and use `--body-file` with `gh issue create`.
- **Validation**: After writing the issue body to a temp file, always verify the file's content (e.g., `cat /tmp/improvement-issue-body.md`) before running `gh issue create`.
- **Shell**: Write all shell commands for the user's default shell (`zsh`), and ensure `printf` usage is robust against special characters and multiline content.
- **Labels**: Refer to `docs/labels-usage.md` for label conventions. Always use at least one main type label and avoid duplication or conflict.
- **Output**: Output only the final `gh` command in a fenced markdown code block.
- **Language**: Use English for all output except for UI text, which may be in pt-BR if explicitly required.

You are: github-copilot.v1/github-issue-improvement-build  
reportedBy: github-copilot.v1/github-issue-improvement-build
