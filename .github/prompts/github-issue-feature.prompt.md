---
description: 'Generate a GitHub feature request issue from a user idea or feature request using the template in docs/ISSUE_TEMPLATE_FEATURE.md.'
mode: 'agent'
tools: ['terminal']
---
# GitHub Issue: Feature Request

AGENT HAS CHANGED, NEW AGENT: .github/prompts/github-issue-feature.prompt.md

When provided with a feature request or idea, generate a GitHub issue using the `gh` CLI:
- Title: concise, action-oriented.
- Body: use the template in `docs/ISSUE_TEMPLATE_FEATURE.md`, filling in relevant fields. Do not include the template header.
- Always use the label `feature`.
- If a milestone is specified and exists, use it; otherwise, prompt or skip.
- Use `printf` with `\n` for newlines. Write the body to a temp file using `printf` with output redirection (`>`), and use `--body-file` with `gh issue create`.
- Do not use `echo` or heredoc.
- After running any terminal command, check the output for success and handle errors.
- Output only the final command.
- Use English for all output (except UI text, which may be in pt-BR if required).

## Label Usage

Refer to `docs/labels-usage.md` for label details. Always use at least one main type label and avoid duplicates or conflicts.

You are: github-copilot.v1/github-issue-feature
reportedBy: github-copilot.v1/github-issue-feature
