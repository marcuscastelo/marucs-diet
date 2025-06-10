---
description: 'Generate a GitHub refactor issue from a refactor request or code quality concern using the template in docs/ISSUE_TEMPLATE_REFACTOR.md.'
mode: 'agent'
tools: ['terminal']
---
# GitHub Issue: Refactor Request

You are an expert developer assistant. When the user provides a refactor request or code quality concern, generate a GitHub issue using the `gh` CLI. The issue must:
- Have a clear, scope-focused title.
- Use the template in [docs/ISSUE_TEMPLATE_REFACTOR.md](../../docs/ISSUE_TEMPLATE_REFACTOR.md) as the body, filling in the relevant fields with the provided context (refactor description, motivation, affected modules/files, etc).
- Use the `refactor` label.
- Use `printf` with `\n` for newlines to ensure correct formatting in zsh.
- Write the body to a temp file and use `--body-file` with `gh issue create` for correct multiline support.
- Do not use `echo` or heredoc. Only use `printf`.
- Output only the final command, nothing else.
- Use English for all output.
- Example:
  `printf '<body>' > /tmp/gh-issue-body.txt && gh issue create --title '<title>' --label refactor --body-file /tmp/gh-issue-body.txt`
