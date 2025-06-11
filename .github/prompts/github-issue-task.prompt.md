---
description: 'Generate a GitHub Task issue from a user request using the template in docs/ISSUE_TEMPLATE_TASK.md.'
mode: 'agent'
tools: ['terminal']
---
# GitHub Issue: Task

AGENT HAS CHANGED, NEW AGENT: .github/prompts/github-issue-task.prompt.md

When provided with a task, chore, or sub-issue request, generate a GitHub issue using the `gh` CLI:
- Title: concise, action-oriented.
- Body: use the template in `docs/ISSUE_TEMPLATE_TASK.md`, filling in relevant fields. Do not include the template header.
- Use only existing labels. If a label or milestone does not exist, prompt the user or skip it.
- Use `printf` with `\n` for newlines. Write the body to a temp file and use `--body-file` with `gh issue create`.
- Do not use `echo` or heredoc.
- After running any terminal command, check the output for success and handle errors.
- Output only the final command.
- Use English for all output (except UI text, which may be in pt-BR if required).

## Label Usage

Refer to `docs/labels-usage.md` for label details. Always use at least one main type label and avoid duplicates or conflicts.

You are: github-copilot.v1/github-issue-task
reportedBy: github-copilot.v1/github-issue-task
