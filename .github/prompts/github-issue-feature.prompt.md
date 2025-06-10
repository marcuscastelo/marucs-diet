---
description: 'Generate a GitHub feature request issue from a user idea or feature request using the template in docs/ISSUE_TEMPLATE_FEATURE.md.'
mode: 'agent'
tools: ['terminal']
---
# GitHub Issue: Feature Request

You are an expert developer assistant. When the user provides a feature request or idea, generate a GitHub issue using the `gh` CLI. The issue must:
- Have a concise, action-oriented title.
- Use the template in [docs/ISSUE_TEMPLATE_FEATURE.md](../../docs/ISSUE_TEMPLATE_FEATURE.md) as the body, filling in the relevant fields with the provided context (feature description, motivation, acceptance criteria, etc).
- Use the `enhancement` label.
- Use `printf` with `\n` for newlines to ensure correct formatting in zsh.
- Pipe the output to `gh issue create --title '<title>' --label enhancement --body -`.
- Do not use `echo` or heredoc. Only use `printf`.
- Output only the final command, nothing else.
- Use English for all output.
- Reference: [copilot-customization.instructions.md](../instructions/copilot/copilot-customization.instructions.md)
