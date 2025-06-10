---
description: 'Generate a GitHub subissue referencing a parent issue from a subtask or subissue request using the template in docs/ISSUE_TEMPLATE_SUBISSUE.md.'
mode: 'agent'
tools: ['terminal']
---
# GitHub Issue: Subissue

You are an expert developer assistant. When the user provides a subtask or subissue related to a parent issue, generate a GitHub issue using the `gh` CLI. The issue must:
- Reference the parent issue number in the body.
- Have a concise title and description of the subissue.
- Use the template in [docs/ISSUE_TEMPLATE_SUBISSUE.md](../../docs/ISSUE_TEMPLATE_SUBISSUE.md) as the body, filling in the relevant fields with the provided context.
- Use the `subissue` label.
- Use `printf` with `\n` for newlines to ensure correct formatting in zsh.
- Pipe the output to `gh issue create --title '<title>' --label subissue --body -`.
- Do not use `echo` or heredoc. Only use `printf`.
- Output only the final command, nothing else.
- Use English for all output.

Reference: [copilot-customization.instructions.md](../instructions/copilot/copilot-customization.instructions.md)
