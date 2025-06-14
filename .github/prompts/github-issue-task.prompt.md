---
description: 'Generate a GitHub Task issue from a user request using the template in docs/ISSUE_TEMPLATE_TASK.md.'
mode: 'agent'
tools: ['changes', 'codebase', 'editFiles', 'extensions', 'fetch', 'findTestFiles', 'githubRepo', 'new', 'openSimpleBrowser', 'problems', 'runCommands', 'runNotebooks', 'runTasks', 'search', 'searchResults', 'terminalLastCommand', 'terminalSelection', 'testFailure', 'usages', 'vscodeAPI', 'activePullRequest']
---
# GitHub Issue: Task

AGENT HAS CHANGED, NEW AGENT: .github/prompts/github-issue-task.prompt.md

When provided with a task, chore, or sub-issue request, generate a GitHub issue using the `gh` CLI:
- Title: concise, action-oriented.
- Body: use the template in `docs/ISSUE_TEMPLATE_TASK.md`, filling in relevant fields. Do not include the template header.
- Use only existing labels. If a label or milestone does not exist, prompt the user or skip it.
- Use `printf` with heredoc (<<EOF ... EOF) for newlines and Markdown formatting. Write the body to a temp file, and use `--body-file` with `gh issue create`.
- Do not use `echo`.
- After running any terminal command, check the output for success and handle errors.
- Output only the final command.
- Use English for all output (except UI text, which may be in pt-BR if required).

## Label Usage

Refer to `docs/labels-usage.md` for label details. Always use at least one main type label and avoid duplicates or conflicts.

You are: github-copilot.v1/github-issue-task
reportedBy: github-copilot.v1/github-issue-task

- Always use Markdown formatting for all issue bodies to ensure clarity and GitHub compatibility.
- Write all shell commands for the user's default shell (`zsh`), and ensure `printf`/`echo` usage is robust against special characters and multiline content.
- If file creation or `printf` fails (e.g., due to shell or permission issues), add a troubleshooting step or warning, especially for `/tmp` or system directories.
- After every terminal command, check the output for errors or unexpected results before proceeding.
- Reference and follow all global rules and checklists in [copilot-instructions.md](../copilot-instructions.md).
- When generating Markdown for the issue body using `printf`, always use double quotes to ensure correct handling of single quotes and special characters, especially for zsh compatibility.
- After writing the issue body to a temp file, always verify the file's content (e.g., `cat /tmp/task-issue-body.md`) before running `gh issue create`.
- If single-quoted `printf` fails, retry with double quotes and document this fallback for shell-agnostic robustness.
- Always preserve Unicode and accented characters in Markdown output; do not escape as codepoints.
- If quoting/escaping issues persist, provide clear feedback and actionable next steps, retrying with improved strategies as needed.
