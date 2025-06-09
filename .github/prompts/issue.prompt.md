---
mode: 'agent'
description: 'Prioritize an open GitHub issue for the current milestone and automate branch creation.'
tools: []
---

Given a milestone (e.g., v0.11.0), use the `gh` CLI to:

1. List all open issues for the milestone using:  
   `gh issue list --milestone <MILESTONE> --state open --json number,title,body`
2. Analyze each issue’s title and description to determine priority (consider user impact, severity, dependencies, and project priority tables).
3. Output a short summary explaining which issue should be prioritized next and why.
4. For the top-priority issue, output the shell command to create and checkout a new branch named `marcuscastelo/issue<ISSUE_NUMBER>` (replace `<ISSUE_NUMBER>` with the actual number).

Requirements:
- Use only the `gh` CLI for all repository queries.
- The summary must be in English, concise, and focused on technical or user impact.
- Output only one shell command for branch creation.
- Do not perform any code changes in this prompt.