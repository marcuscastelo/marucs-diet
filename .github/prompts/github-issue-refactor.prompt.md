---
description: 'Generate a GitHub refactor issue from a refactor request or code quality concern using the template in docs/ISSUE_TEMPLATE_REFACTOR.md.'
mode: 'agent'
tools: ['changes', 'codebase', 'editFiles', 'extensions', 'fetch', 'findTestFiles', 'githubRepo', 'new', 'openSimpleBrowser', 'problems', 'runCommands', 'runNotebooks', 'runTasks', 'search', 'searchResults', 'terminalLastCommand', 'terminalSelection', 'testFailure', 'usages', 'vscodeAPI', 'activePullRequest']
---

# GitHub Issue: Refactor Request

AGENT HAS CHANGED, NEW AGENT: .github/prompts/github-issue-refactor.prompt.md

When provided with a refactor request or a code quality concern, generate a GitHub issue using the GitHub CLI (`gh`) as follows:

## Steps

1. **Title**: Write a clear, scope-focused title. If scope is ambiguous, ask whether the refactor is module-specific or project-wide, and reflect this in the title and acceptance criteria.
2. **Body**:
   - Use the template in `docs/ISSUE_TEMPLATE_REFACTOR.md`, but **exclude the template header**.
   - Fill in the relevant fields only.
   - Use `printf` with `\n` for newlines. Write the issue body to a temporary file using `printf` with output redirection (`>`), and use the `--body-file` option with `gh issue create`.
   - **Do not** use `echo` or heredoc syntax.
   - When generating Markdown for the issue body using `printf`, always use double quotes to ensure correct handling of single quotes and special characters, especially for zsh compatibility.
   - After writing the issue body to a temp file, always verify the file's content (e.g., `cat /tmp/refactor-issue-body.md`) before running `gh issue create`.
   - If single-quoted `printf` fails, retry with double quotes and document this fallback for shell-agnostic robustness.
   - Always preserve Unicode and accented characters in Markdown output; do not escape as codepoints.
   - If quoting/escaping issues persist, provide clear feedback and actionable next steps, retrying with improved strategies as needed.
   - Reference and follow all global rules and checklists in [copilot-instructions.md](../instructions/copilot/copilot-instructions.md).
   - **Explicitly reference all affected files and modules in the issue body for clarity and implementation readiness.**
   - **After any label or content change, always re-validate and, if necessary, re-edit the issue body before final creation.**
3. **Labels and Milestones**:
   - Use only existing labels and milestones.
   - **Always validate the existence of all labels before attempting to create issues. Remove or skip any that are missing.**
   - If a required label or milestone is missing, **automatically retry without it** rather than asking the user or halting.
   - Refer to `docs/labels-usage.md` for label conventions. Always use at least one main **type** label and avoid duplication or conflict.
4. **Validation**:
   - After running any CLI command, check the output for success.
   - **Report and handle all CLI errors (e.g., missing labels) and retry with corrected parameters as needed.**
   - Handle any errors gracefully and report them to the user if necessary.
   - **Report all CLI errors and their resolutions in the session summary for traceability.**

## Troubleshooting

- If you encounter common CLI errors (e.g., missing labels, permission issues), consult the troubleshooting section below for recommended actions:
  - **Missing label**: Remove the label and retry issue creation.
  - **Permission denied**: Check authentication and repository access, then retry.
  - **Other errors**: Log the error, attempt a fix if possible, and report in the session summary.

## Output Format

- Output only the **final `gh` command** in a fenced markdown code block.
- Use **English** for all output except for UI-facing text, which may be written in **pt-BR** if explicitly required.

You are: github-copilot.v1/github-issue-refactor
reportedBy: github-copilot.v1/github-issue-refactor
