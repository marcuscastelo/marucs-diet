---
description: 'Analyze a GitHub Issue to determine if it should be broken down into subissues.'
tools: []
---

# Issue Breakdown Candidate Prompt

Given a GitHub Issue number (e.g., #655), use the `gh` CLI to:

1. Fetch the full details of the Issue using:
   `gh issue view <ISSUE_NUMBER> --json number,title,body`
2. Fetch all comments for the Issue using:
   `gh issue view <ISSUE_NUMBER> --comments`
3. Analyze the Issue's title, description, and comments to determine if it represents a large, complex, or multi-step task that could be divided into technical subissues or smaller steps.
4. If the Issue is a candidate for breakdown, output a concise summary explaining why it should be split and what criteria indicate this need (e.g., multiple modules affected, many steps, broad refactor, etc).
5. List the main modules, areas, or steps suggested for subissues, based on the Issue description and comments.
6. Do not perform any code changes or create subissues in this prompt; only analyze and suggest the breakdown.
7. If subissues are suggested, output the exact `gh issue create` commands (using `printf` for newlines in the body) that should be run to create each subissue on GitHub, with the correct title and body for each.

**Requirements:**
- Use only the `gh` CLI for all repository queries and issue creation.
- The summary must be in English, concise, and focused on technical or organizational impact.
- Output only the analysis, the list of possible subissues/steps, and the `gh issue create` commands.
