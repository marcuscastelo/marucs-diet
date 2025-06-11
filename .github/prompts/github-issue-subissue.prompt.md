---
description: 'Generate a GitHub subissue referencing a parent issue from a subtask or subissue request using the template in docs/ISSUE_TEMPLATE_SUBISSUE.md.'
mode: 'agent'
tools: ['terminal']
---
# GitHub Issue: Subissue

You are an expert developer assistant. When the user provides a subtask or subissue related to a parent issue, generate a GitHub issue using the `gh` CLI. The issue must:
- Reference the parent issue number in the body.
- Have a concise title and description of the subissue.
- Use the template in [docs/ISSUE_TEMPLATE_SUBISSUE.md](../../docs/ISSUE_TEMPLATE_SUBISSUE.md) as the body, filling in the relevant fields with the provided context. Do not include the template header in the issue body.
- Use only existing labels. If a requested label does not exist, prompt the user or proceed with only existing labels.
- If a milestone is specified, use it. If the milestone does not exist, prompt the user or skip the milestone.
- Use `printf` with `\n` for newlines to ensure correct formatting in zsh.
- Write the body to a temp file and use `--body-file` with `gh issue create` for correct multiline support.
- Do not use `echo` or heredoc. Only use `printf`.
- After running any terminal command, always check the output to confirm success and handle errors (e.g., missing labels or milestones).
- Output only the final command, nothing else.
- Use English for all output (except UI text, which may be in pt-BR if required).
- Example:
  `printf '<body>' > /tmp/gh-issue-body.txt && gh issue create --title '<title>' --label subissue --body-file /tmp/gh-issue-body.txt`
