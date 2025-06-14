---
description: 'Generate a GitHub subissue referencing a parent issue from a subtask or subissue request using the template in docs/ISSUE_TEMPLATE_SUBISSUE.md.'
mode: 'agent'
tools: ['changes', 'codebase', 'editFiles', 'extensions', 'fetch', 'findTestFiles', 'githubRepo', 'new', 'openSimpleBrowser', 'problems', 'runCommands', 'runNotebooks', 'runTasks', 'search', 'searchResults', 'terminalLastCommand', 'terminalSelection', 'testFailure', 'usages', 'vscodeAPI', 'activePullRequest']
---

# GitHub Issue: Subissue

AGENT HAS CHANGED, NEW AGENT: .github/prompts/github-issue-subissue.prompt.md

When given a subtask or subissue related to a parent GitHub issue, generate a new issue using the GitHub CLI (`gh`) as follows:

## Steps

1. **Title**: Write a concise and descriptive title.
2. **Body**:
   - Use the template in `docs/ISSUE_TEMPLATE_SUBISSUE.md`, but exclude the template header.
   - Fill in all relevant fields.
   - Include a reference to the parent issue number in the body (e.g., `Part of #123`).
   - Use `printf` with heredoc (<<EOF ... EOF) for newlines and Markdown formatting. Write the body to a temp file, and use the `--body-file` option with `gh issue create`.
   - Do not use `echo` or heredoc syntax.
   - When generating Markdown for the issue body using `printf`, always use double quotes to ensure correct handling of single quotes and special characters, especially for zsh compatibility.
   - After writing the issue body to a temp file, always verify the file's content (e.g., `cat /tmp/subissue-issue-body.md`) before running `gh issue create`.
   - If single-quoted `printf` fails, retry with double quotes and document this fallback for shell-agnostic robustness.
   - Always preserve Unicode and accented characters in Markdown output; do not escape as codepoints.
   - If quoting/escaping issues persist, provide clear feedback and actionable next steps, retrying with improved strategies as needed.
   - Reference and follow all global rules and checklists in [copilot-instructions.md](../copilot-instructions.md).
3. **Labels and Milestones**:
   - Use only existing labels.
   - If a required label or milestone is missing, ask the user or skip it.
   - Refer to `docs/labels-usage.md` for label conventions.
   - Always use at least one main **type** label, and avoid conflicts or duplicates.
4. **Validation**:
   - After running any CLI command, check its output.
   - Report and handle errors if they occur.

## Output Format

- Output only the final `gh` command, inside a markdown code block.
- Use **English** for all output except for UI text, which may be in **pt-BR** if explicitly required.

You are: github-copilot.v1/github-issue-subissue
reportedBy: github-copilot.v1/github-issue-subissue
