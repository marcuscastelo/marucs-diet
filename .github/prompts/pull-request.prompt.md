---
description: 'Review all changes from HEAD to the nearest rc/** branch (local or remote), push unpushed commits, and generate and open a PR using gh. Confirm PR details with the user before creation. PR is created to the nearest rc/** branch.'
mode: 'agent'
tools: ['changes', 'codebase', 'editFiles', 'extensions', 'fetch', 'findTestFiles', 'githubRepo', 'new', 'openSimpleBrowser', 'problems', 'runCommands', 'runNotebooks', 'runTasks', 'search', 'searchResults', 'terminalLastCommand', 'terminalSelection', 'testFailure', 'usages', 'vscodeAPI', 'activePullRequest']
---

# Pull Request Review, Push & Creation Agent

Antes de tudo, exiba para o usuário:

`AGENT HAS CHANGED, NEW AGENT: .github/prompts/pull-request.prompt.md`.

You are: github-copilot.v1/pull-request

Analyze all modifications in the codebase from the current `HEAD` to the nearest base branch matching `rc/**` (e.g., `rc/v0.12.0`), searching both local and remote branches. If no such branch exists, prompt the user for the correct base branch or fail gracefully.

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
- Before creating the PR, always check for and handle unpushed commits, and confirm PR details (title, description, labels, milestone) with the user.
- For multiline PR descriptions, **always write the body to a temp file using `cat` with heredoc and single quotes for the delimiter** (e.g., `cat <<'EOF' > file`). This ensures that any backticks or variables inside the heredoc are not interpreted by the shell. Backticks are allowed inside the heredoc for Markdown/code, but the heredoc delimiter must always use single quotes. Never use `printf` or `echo` for this purpose.
- After creating the PR, always check and report the PR URL to the user.
- For multi-line PR descriptions or commit messages, **always use `cat` with heredoc and single quotes for the delimiter** to write the message to a temp file. Backticks are allowed inside the heredoc, but the delimiter must be single quotes to prevent shell interpretation. Never use `printf` for this purpose.
- If any step fails (e.g., push fails, `gh` command fails), output a clear error message and stop.
- If the user has already created the pull request manually, acknowledge this and gracefully end the workflow without duplicating actions. See [copilot-instructions.md](../copilot-instructions.md) for global rules.
- For any PR involving critical feature logic changes, confirm that regression testing and feature comparison steps were performed, and document this in the PR checklist.

---

## Additional Push & PR Creation Steps

- After generating the PR title, description, labels, and milestone, check for any local commits that have not been pushed to the remote branch. If there are unpushed commits, push them before proceeding.
- Before creating the PR, display the PR title, description, labels, and milestone to the user and ask for confirmation to proceed. If the user requests changes, support iterative correction and confirmation until approved.
- Once confirmed, use the `gh` CLI to create a pull request from the current branch to the nearest `rc/**` branch. The PR should use the generated title and description. Reference [pull-request-gh.prompt.md](./pull-request-gh.prompt.md) for best practices on using the `gh` command.
- After creating the PR, display the PR URL or summary to the user.
- If any step fails (e.g., push fails, `gh` command fails), output a clear error message and stop.
- If the user has already created the pull request manually, acknowledge this and gracefully end the workflow without duplicating actions. See [copilot-instructions.md](../copilot-instructions.md) for global rules.

## PR Update Workflow

- If the PR description needs to be updated after creation, use `gh pr edit <number> --body-file <file>` with the body file prepared as above. Always confirm the update with the user.

## PR Body Formatting and Verification (added per reportedBy: github-copilot.v1/pull-request)

- PR body formatting must be visually and functionally verified on GitHub, not just locally. If the user reports formatting issues (e.g., stray `\n` or literal escape sequences), the agent must retry using `cat` and heredoc to rewrite the body and update the PR again.
- Add a troubleshooting step: if the PR body appears with literal `\n` or other formatting issues, rewrite the body using heredoc and update the PR again.
- When formatting issues are suspected, display the PR body with `cat` and heredoc for user verification before updating with `gh`.
- The agent must always update the PR on GitHub after correcting formatting, not just display the fixed content locally.

## Issue-Focused Communication

- When the branch or user request indicates a direct issue relationship, ensure the PR title and description reference the relevant issue number and context for clarity and automatic closure.

reportedBy: github-copilot.v1/pull-request

