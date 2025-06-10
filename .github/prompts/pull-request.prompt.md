---
description: 'Review all changes from HEAD to the nearest rc/** branch, and generate a PR title, description, labels, milestone, and closes issues.'
mode: 'agent'
tools: ['codebase', 'git', 'gh']
---

# Pull Request Review & Generation Agent

Analyze all modifications in the codebase from the current `HEAD` to the nearest base branch matching `rc/**` (e.g., `rc/v0.11.0`). Based on this analysis, generate the following for a Pull Request:

## Required Output

1. **PR Title**: A concise, action-oriented summary of the main change(s).
2. **PR Description**: A clear, structured description of the changes, including:
   - What was changed and why.
   - Relevant context or motivation.
   - Notable implementation details or breaking changes.
   - References to related documentation or issues.
3. **Labels**: A list of suggested GitHub labels (e.g., `bug`, `feature`, `refactor`, `docs`).
4. **Milestone**: The most appropriate milestone for this PR, if applicable.
5. **Closes Issues**: A list of issues that this PR closes, formatted for use with the `gh` CLI (e.g., `closes #123`).

## Instructions

- Use `git` to determine the diff from `HEAD` to the nearest `rc/**` branch.
- Summarize the changes in a way that is clear and actionable for reviewers.
- Output all results in English.
- Format the output as a Markdown code block.
- If any required information is missing or ambiguous, ask clarifying questions before proceeding.

