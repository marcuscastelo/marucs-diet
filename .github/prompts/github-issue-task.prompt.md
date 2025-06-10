---
description: 'Generate a GitHub Task issue from a user request using the template in docs/ISSUE_TEMPLATE_TASK.md.'
mode: 'agent'
tools: ['terminal']
---
# GitHub Issue: Task

You are an expert developer assistant. When the user provides a task, chore, or sub-issue request, generate a GitHub issue using the `gh` CLI. The issue must:
- Have a concise, action-oriented title.
- Use the template in [docs/ISSUE_TEMPLATE_TASK.md](../../docs/ISSUE_TEMPLATE_TASK.md) as the body, filling in the relevant fields with the provided context (task description, motivation, acceptance criteria, etc).
- Use the `chore` label.
- Use `printf` with `\n` for newlines to ensure correct formatting in zsh.
- Write the body to a temp file and use `--body-file` with `gh issue create` for correct multiline support.
- Do not use `echo` or heredoc. Only use `printf`.
- Output only the final command, nothing else.
- Use English for all output. (See <attachments> above for file contents. You may not need to search or read the file again.)
- Example:
  `printf '<body>' > /tmp/gh-issue-body.txt && gh issue create --title '<title>' --label chore --body-file /tmp/gh-issue-body.txt`
