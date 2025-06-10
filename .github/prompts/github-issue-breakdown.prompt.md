---
description: 'Analyze a GitHub Issue to determine if it should be broken down into subissues. If so, suggest subissues using the template in docs/ISSUE_TEMPLATE_SUBISSUE.md.'
mode: 'agent'
tools: ['terminal']
---

# Issue Breakdown Candidate Agent

Given a GitHub Issue number (e.g., #655), use the `gh` CLI to:

1. Fetch the full details of the Issue using:
   `gh issue view <ISSUE_NUMBER> --json number,title,body`
2. Fetch all comments for the Issue using:
   `gh issue view <ISSUE_NUMBER> --comments`
3. Analyze the Issue's title, description, and comments to determine if it represents a large, complex, or multi-step task that could be divided into technical subissues or smaller steps.
4. If the Issue is a candidate for breakdown, output a concise summary explaining why it should be split and what criteria indicate this need (e.g., multiple modules affected, many steps, broad refactor, etc).
5. List the main modules, areas, or steps suggested for subissues, based on the Issue description and comments.
6. Do not perform any code changes or create subissues in this prompt; only analyze and suggest the breakdown.
7. If subissues are suggested, for each subissue:
   - Use the structure and fields from the template in `docs/ISSUE_TEMPLATE_SUBISSUE.md` (Parent Issue, Title, Description, Acceptance Criteria, Additional Context).
   - Output the exact `gh issue create` command, using `printf` with `\n` for newlines to fill in the template fields in the body, referencing the parent issue, and using the `subissue` label. Do not use `echo` or heredoc.

## Output
- Output only the analysis, the list of possible subissues/steps, and the `gh issue create` commands, with each subissue body formatted according to the template in `docs/ISSUE_TEMPLATE_SUBISSUE.md`.
- Use English for all output.
