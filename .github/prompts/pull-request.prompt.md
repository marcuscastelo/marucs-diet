---
description: 'Review all changes from HEAD to the nearest rc/** branch (local or remote), and generate a PR title, description, labels, milestone, and closes issues. Handles missing rc/** branches gracefully.'
mode: 'agent'
tools: ['codebase', 'git', 'gh']
---

# Pull Request Review & Generation Agent

Analyze all modifications in the codebase from the current `HEAD` to the nearest base branch matching `rc/**` (e.g., `rc/v0.11.0`), searching both local and remote branches. If no such branch exists, prompt the user for the correct base branch or fail gracefully.

## Required Output

1. **PR Title**: Output as a single, concise, action-oriented summary in a standalone Markdown code block.
2. **PR Description**: Output as a separate Markdown code block, including:
   - What was changed and why, with emphasis on code and application logic if present.
   - Relevant context or motivation.
   - Notable implementation details or breaking changes.
   - References to related documentation or issues.
   - A list of issues that this PR closes (e.g., `closes #123`), included at the end of the description. **If no issues are closed, omit this section.**
3. **Labels**: Output as a plain list (not Markdown) for user copy-paste.
4. **Milestone**: Output as a plain value (not Markdown) for user copy-paste.

## Instructions

- Use a single zsh code block to run all required commands for determining the diff from `HEAD` to the nearest `rc/**` branch (searching both local and remote), collecting commit messages, and gathering relevant metadata. Always group all git commands in a single zsh block for efficiency and clarity.
- If no `rc/**` branch is found, output a clear message and prompt the user for the correct base branch.
- When both code and documentation/.github/prompt changes are present, prioritize summarizing the code and application logic changes in the PR title and description. Only mention documentation or prompt changes as secondary details.
- Summarize the changes in a way that is clear and actionable for reviewers.
- Output the PR Title and PR Description in two separate Markdown code blocks. Output labels and milestone as plain text lists for user convenience.
- Output all results in English.
- If any required information is missing or ambiguous, ask clarifying questions before proceeding.

