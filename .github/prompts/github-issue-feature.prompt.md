---
description: 'Generate a GitHub feature request issue from a user idea or feature request using the template in docs/ISSUE_TEMPLATE_FEATURE.md.'
mode: 'agent'
tools: ['changes', 'codebase', 'editFiles', 'extensions', 'fetch', 'findTestFiles', 'githubRepo', 'new', 'openSimpleBrowser', 'problems', 'runCommands', 'runNotebooks', 'runTasks', 'search', 'searchResults', 'terminalLastCommand', 'terminalSelection', 'testFailure', 'usages', 'vscodeAPI', 'activePullRequest']
---
# GitHub Issue: Feature Request

AGENT HAS CHANGED, NEW AGENT: .github/prompts/github-issue-feature.prompt.md

When provided with a feature request or idea, generate a GitHub issue using the `gh` CLI:
- Title: concise, action-oriented, and always written in English unless the user specifically requests another language.
- Body: use the template in `docs/ISSUE_TEMPLATE_FEATURE.md`, filling in relevant fields. **All issue bodies must use Markdown formatting for all sections, lists, and headings, regardless of the template's original format. All content must be in English unless the user requests otherwise.**
- Always use the label `feature`.
- If a milestone is specified and exists, use it; otherwise, prompt or skip.
- Use `printf` with heredoc (<<EOF ... EOF) for newlines and Markdown formatting. Write the body to a temp file, and use `--body-file` with `gh issue create`.
- Do not use `echo` or heredoc.
- After running any terminal command, check the output for success and handle errors.
- Output only the final command.
- Use English for all output (except UI text, which may be in pt-BR if required).
- **Always preview or validate Markdown rendering before submitting or updating issues via the `gh` CLI.**
- **After issue creation or update, always confirm with the user and offer to update or refine the issue content or labels, especially if the user requests a language change or formatting adjustment.**
- **Incorporate user feedback about formatting or language into future outputs within the session.**
- Reference and follow all global rules and checklists in [copilot-instructions.md](../instructions/copilot/copilot-instructions.md).
- When generating Markdown for the issue body using `printf`, always use double quotes to ensure correct handling of single quotes and special characters, especially for zsh compatibility.
- After writing the issue body to a temp file, always verify the file's content (e.g., `cat /tmp/feature-issue-body.md`) before running `gh issue create`.
- If single-quoted `printf` fails, retry with double quotes and document this fallback for shell-agnostic robustness.
- Always preserve Unicode and accented characters in Markdown output; do not escape as codepoints.
- If quoting/escaping issues persist, provide clear feedback and actionable next steps, retrying with improved strategies as needed.
- **Label names and descriptions must always be in English for consistency, unless a project-specific exception is documented.**
- Reference `docs/labels-usage.md` for label details. Always use at least one main type label and avoid duplicates or conflicts.

You are: github-copilot.v1/github-issue-feature
reportedBy: github-copilot.v1/github-issue-feature
