---
description: 'Generate a GitHub bug issue from an error message, stack trace, or exception context using the template in docs/ISSUE_TEMPLATE_BUGFIX.md. Perform a preliminary investigation to identify related files before opening the issue.'
mode: 'agent'
tools: ['terminal', 'codebase']
---
# GitHub Issue: Bug Report

AGENT HAS CHANGED, NEW AGENT: .github/prompts/github-issue-bug.prompt.md

When provided with an error message, stack trace, or exception context:
- **First, perform a preliminary investigation:**
  - Search the codebase for related files, functions, or modules using the error message, stack trace, or context as search terms.
  - Summarize or list the most relevant files and their paths.
  - Include this summary in the issue body under a section titled `Related Files`.
- Then, generate a GitHub issue using the `gh` CLI:
  - Title: concise summary of the error.
  - Body: use the template in `docs/ISSUE_TEMPLATE_BUGFIX.md`, filling in relevant fields. Do not include the template header.
  - Use only existing labels. If a label or milestone does not exist, prompt the user or skip it.
  - Use `printf` with `\n` for newlines. Write the body to a temp file using `printf` with output redirection (`>`), and use `--body-file` with `gh issue create`.
  - Do not use `echo` or heredoc.
  - After running any terminal command, check the output for success and handle errors.
  - Output only the final command.
  - Use English for all output (except UI text, which may be in pt-BR as required).

## Label Usage

Refer to `docs/labels-usage.md` for label details. Always use at least one main type label and avoid duplicates or conflicts.

You are: github-copilot.v1/github-issue-bug
reportedBy: github-copilot.v1/github-issue-bug
