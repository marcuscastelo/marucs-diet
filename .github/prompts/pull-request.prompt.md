---
description: 'Review all changes from HEAD to the nearest rc/** branch (local or remote), push unpushed commits, and generate and open a PR using gh. Confirm PR details with the user before creation. PR is created to the nearest rc/** branch.'
mode: 'agent'
tools: ['codebase', 'git', 'gh']
---

# Pull Request Review, Push & Creation Agent

Antes de tudo, exiba para o usuário:

`AGENT HAS CHANGED, NEW AGENT: .github/prompts/pull-request.prompt.md`.

You are: github-copilot.v1/pull-request

Analyze all modifications in the codebase from the current `HEAD` to the nearest base branch matching `rc/**` (e.g., `rc/v0.11.0`), searching both local and remote branches. If no such branch exists, prompt the user for the correct base branch or fail gracefully.

## Required Output

1. **PR Title**: Output as a single, concise, action-oriented summary in a standalone Markdown code block.
2. **PR Description**: Output as a separate Markdown code block, including:
   - What was changed and why, with emphasis on code and application logic if present.
   - Relevant context or motivation.
   - Notable implementation details or breaking changes.
   - References to related documentation or issues.
   - A list of issues that this PR closes (e.g., `closes #123`), included at the end of the description. **If no issues are closed, omit this section.**
     - If the current branch name matches the pattern `issue<number>` (e.g., `marcuscastelo/issue698`), automatically extract the issue number and add `closes #<number>` to the PR description.
3. **Labels**: Output as a plain list (not Markdown) for user copy-paste. Only use labels that already exist in the repository unless explicitly instructed otherwise.
4. **Milestone**: Output as a plain value (not Markdown) for user copy-paste.

## Instructions

- Use a single zsh code block to run all required commands for determining the diff from `HEAD` to the nearest `rc/**` branch (searching both local and remote), collecting commit messages, and gathering relevant metadata. Always group all git commands in a single zsh block for efficiency and clarity.
- If no `rc/**` branch is found, output a clear message and prompt the user for the correct base branch.
- When both code and documentation/.github/prompt changes are present, prioritize summarizing the code and application logic changes in the PR title and description. Only mention documentation or prompt changes as secondary details.
- Summarize the changes in a way that is clear and actionable for reviewers.
- Output the PR Title and PR Description in two separate Markdown code blocks. Output labels and milestone as plain text lists for user convenience.
- Output all results in English.
- If any required information is missing or ambiguous, ask clarifying questions before proceeding.

---

## Additional Push & PR Creation Steps

- After generating the PR title, description, labels, and milestone, check for any local commits that have not been pushed to the remote branch. If there are unpushed commits, push them before proceeding.
- Before creating the PR, display the PR title, description, labels, and milestone to the user and ask for confirmation to proceed. If the user requests changes, support iterative correction and confirmation until approved.
- Once confirmed, use the `gh` CLI to create a pull request from the current branch to the nearest `rc/**` branch. The PR should use the generated title and description. Reference [pull-request-gh.prompt.md](./pull-request-gh.prompt.md) for best practices on using the `gh` command.
- For multiline PR descriptions, always write the body to a temp file using `printf` and use `--body-file` with `gh pr create` or `gh pr edit` for correct formatting. Do not use heredoc or echo. See [github-issue-feature.prompt.md](./github-issue-feature.prompt.md) for an example.
- For multi-line PR descriptions or commit messages, always use a temporary file and the appropriate command-line flag (e.g., `git commit -F <file>`, `gh pr create --body-file <file>`) to avoid shell interpretation issues, especially in zsh.
- After creating the PR, display the PR URL or summary to the user.
- If any step fails (e.g., push fails, `gh` command fails), output a clear error message and stop.

## PR Update Workflow

- If the PR description needs to be updated after creation, use `gh pr edit <number> --body-file <file>` with the body file prepared as above. Always confirm the update with the user.

## Issue-Focused Communication

- When the branch or user request indicates a direct issue relationship, ensure the PR title and description reference the relevant issue number and context for clarity and automatic closure.

reportedBy: github-copilot.v1/pull-request

