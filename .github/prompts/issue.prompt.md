---
mode: 'agent'
description: 'Prioritize an open GitHub issue for the current milestone and automate branch creation.'
tools: ['githubRepo']
---

The repository is `marcuscastelo/marucs-diet` and the milestone is `v0.11.0`.
Given a milestone (e.g., v0.11.0), use #githubRepo to:

1. List all open issues for the milestone.
2. Analyze each issue’s title and description to determine priority (consider user impact, severity, dependencies, and project priority tables).
3. Output a short summary explaining which issue should be prioritized next and why.
4. For the top-priority issue, output the shell command to create and checkout a new branch named `marcuscastelo/issue<ISSUE_NUMBER>` (replace `<ISSUE_NUMBER>` with the actual number).

Requirements:
- Use only #githubRepo for all repository queries.
- The summary must be in English, concise, and focused on technical or user impact.
- Output only one shell command for branch creation.
- Do not perform any code changes in this prompt.