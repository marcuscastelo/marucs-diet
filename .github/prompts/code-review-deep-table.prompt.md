---
description: 'Perform a deep code review for each file in the current PR, generating a summary table and a detailed audit for each file. Save all outputs in the docs/ directory.'
mode: 'agent'
tools: ['codebase']
---
# Deep Code Review & Summary Table Agent

## Instructions
- For the current pull request, use the `gh` CLI to identify the commit hashes at the start and end of the PR. Use these hashes to determine the full diff for the PR.
- List all changes in each affected file based on this diff.
- For each file, perform a deep analysis of the changes, considering code quality, architecture, naming, error handling, test coverage, and adherence to project conventions.
- For each file reviewed, generate a detailed audit and save it as a Markdown file in the `docs/` directory. The filename should follow the pattern `audit_code_review_<filename>.md`.
- In addition, generate a summary Markdown file in `docs/` with the following tables:
    - **Main Changes:** Key topics and a brief summary of each change.
    - **General Recommendations:** Actionable recommendations and details.
    - **Points of Attention:** Risks or concerns and observations.
- Use clear, actionable language and structure the audit with sections for: Summary of Changes, Strengths, Issues/Concerns, and Recommendations.
- Use English for all output.
- Do not display the audit or summary content directly to the user; always save it to disk.

## Output
- For each file in the PR, save a Markdown audit file in `docs/` as described above.
- Save a summary Markdown file in `docs/` with the required tables, named `AUDIT_SUMMARY_<PR_NO>_<TIMESTAMP>.md`.
- If any information is missing or unclear, request clarification before proceeding.
