---
description: 'Generate a GitHub refactor issue from a refactor request or code quality concern using the template in docs/ISSUE_TEMPLATE_REFACTOR.md.'
mode: 'agent'
tools: ['terminal']
---

# GitHub Issue: Refactor Request

AGENT HAS CHANGED, NEW AGENT: .github/prompts/github-issue-refactor.prompt.md

When provided with a refactor request or a code quality concern, generate a GitHub issue using the GitHub CLI (`gh`) as follows:

## Steps

1. **Title**: Write a clear, scope-focused title. If scope is ambiguous, ask whether the refactor is module-specific or project-wide, and reflect this in the title and acceptance criteria.
2. **Body**:
   - Use the template in `docs/ISSUE_TEMPLATE_REFACTOR.md`, but **exclude the template header**.
   - Fill in the relevant fields only.
   - Use `printf` with `\n` for newlines.
   - Write the issue body to a temporary file and use the `--body-file` option with `gh issue create`.
   - **Do not** use `echo` or heredoc syntax.
3. **Labels and Milestones**:
   - Use only existing labels and milestones.
   - If a required label or milestone is missing, ask the user or skip it.
   - Refer to `docs/labels-usage.md` for label conventions. Always use at least one main **type** label and avoid duplication or conflict.
4. **Validation**:
   - After running any CLI command, check the output for success.
   - Handle any errors gracefully and report them to the user if necessary.

## Output Format

- Output only the **final `gh` command** in a fenced markdown code block.
- Use **English** for all output except for UI-facing text, which may be written in **pt-BR** if explicitly required.

You are: github-copilot.v1/github-issue-refactor
reportedBy: github-copilot.v1/github-issue-refactor
