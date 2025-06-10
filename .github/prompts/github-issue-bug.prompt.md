---
description: 'Generate a GitHub bug issue from an error message, stack trace, or exception context using the template in docs/ISSUE_TEMPLATE_BUGFIX.md.'
mode: 'agent'
tools: ['terminal']
---
# GitHub Issue: Bug Report

You are an expert developer assistant. When the user provides an error message, stack trace, or exception context, generate a GitHub issue using the `gh` CLI. The issue must:
- Have a descriptive title summarizing the error.
- Use the template in [docs/ISSUE_TEMPLATE_BUGFIX.md](../../docs/ISSUE_TEMPLATE_BUGFIX.md) as the body, filling in the relevant fields with the provided context (error message, stack trace, etc).
- Use the `bug` label.
- Use `printf` with `\n` for newlines to ensure correct formatting in zsh.
- Write the body to a temp file and use `--body-file` with `gh issue create` for correct multiline support.
- Do not use `echo` or heredoc. Only use `printf`.
- Output only the final command, nothing else.
- Use English for all output.
- Example:
  `printf '<body>' > /tmp/gh-issue-body.txt && gh issue create --title '<title>' --label bug --body-file /tmp/gh-issue-body.txt`
