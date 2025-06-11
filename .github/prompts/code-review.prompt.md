---
description: "Review all changes in a pull request, generate a list of actionable corrections, and automatically apply them in atomic commits."
mode: "agent"
tools: ["codebase", "git", "gh"]
---

# Pull Request Auto-Review & Correction Agent

Analyze all modifications in the codebase from the current `HEAD` to the nearest base branch matching `rc/**` (local or remote), using the same diff and context as the [pull-request.prompt.md](./pull-request.prompt.md) file.

## Instructions

- Review all changes included in the pull request, including code, documentation, configuration, and prompt files.
- Identify and list:
  - Suggestions for improvement (code style, architecture, clarity, maintainability, etc.)
  - Potential bugs or problematic patterns
  - Any other issues, inconsistencies, or risks
- For each actionable item, generate a concrete correction or improvement.
- Present the full list of planned corrections to the user, grouped by atomic commit, before making any changes.
- After user confirmation, apply each correction in a separate atomic commit, following the conventional commits style for commit messages.
- Do not summarize or approve the PR; only output actionable review and correction steps.
- If the PR includes both code and documentation/prompt changes, review both, but prioritize code and application logic.
- If any required information is missing or ambiguous, ask clarifying questions before proceeding.
- Output the review and planned actions as a Markdown bullet list, grouped by commit.
- Use English for all output.
- Never output comments that state the absence of issues (e.g., no usage of `any` found, no usage of `handleApiError` found, etc.).

## Output

- Output a single Markdown code block containing the review and planned actions, grouped by atomic commit.
- Reference any relevant files or lines if possible.
- After user approval, execute the corrections and output the commit messages.
