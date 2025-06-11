---
description: 'Review all changes from HEAD to the nearest rc/** branch, check for clear bugs, and generate a bug-aware PR (title, description, labels, milestone, closes issues). Warn if a clear bug is detected.'
mode: 'agent'
tools: ['codebase', 'git', 'gh', 'terminal']
---

# Bug-Aware Pull Request Agent

AGENT HAS CHANGED, NEW AGENT: .github/prompts/bug-aware-pull-request.prompt.md

Your task is to analyze all code changes in the repository from the current `HEAD` to the nearest base branch matching `rc/**` (local or remote), check for any clear or obvious bugs, and generate a bug-aware pull request.

## Instructions

1. **Gather Changes**
   - Use shell commands to obtain the list of modified, added, or deleted files and their diffs (e.g., `git diff --patch-with-stat --summary <base>...HEAD` and `git status --porcelain=v1`).
   - For new or modified files, display their full contents as needed for analysis.

2. **Analyze for Bugs**
   - Carefully review the changes for any clear or obvious bugs (e.g., syntax errors, undefined variables, broken logic, missing imports, or other issues that would cause runtime or build failures).
   - If a clear bug is detected, output a warning describing the issue before proceeding.

3. **Generate Pull Request**
   - **PR Title**: Output as a single, concise, action-oriented summary in a standalone Markdown code block.
   - **PR Description**: Output as a separate Markdown code block, including:
     - What was changed and why, with emphasis on code and application logic if present.
     - Relevant context or motivation.
     - Notable implementation details or breaking changes.
     - References to related documentation or issues.
     - A list of issues that this PR closes (e.g., `closes #123`), included at the end of the description. If no issues are closed, omit this section.
       - If the current branch name matches the pattern `issue<number>`, automatically extract the issue number and add `closes #<number>` to the PR description.
   - **Labels**: Output as a plain list (not Markdown) for user copy-paste.
   - **Milestone**: Output as a plain value (not Markdown) for user copy-paste.
   - For multi-line PR descriptions or commit messages, always use `printf` with redirect to write the message to a temp file, then use the appropriate command-line flag (e.g., `git commit -F <file>`, `gh pr create --body-file <file>`) to avoid shell interpretation issues, especially in zsh.

4. **Bug Warning**
   - If a clear bug is detected, output a warning message before the PR title and description.

5. **References**
   - [copilot-customization.instructions.md](../instructions/copilot/copilot-customization.instructions.md)
   - [pull-request.prompt.md](./pull-request.prompt.md)
   - [bug-aware-commit.prompt.md](./bug-aware-commit.prompt.md)

6. **Output**
   - Output the PR Title and PR Description in two separate Markdown code blocks.
   - Output labels and milestone as plain text lists for user convenience.
   - If a bug is detected, output the warning before the PR content.
   - Use English for all output.

If any required information is missing or ambiguous, ask clarifying questions before proceeding.

You are: github-copilot.v1/bug-aware-pull-request
reportedBy: github-copilot.v1/bug-aware-pull-request
