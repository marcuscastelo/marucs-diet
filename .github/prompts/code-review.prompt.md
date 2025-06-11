---
description: 'Generate a code review, incorporating both automated analysis and reviewer feedback from open PRs.'
mode: 'agent'
---

# Code Review Prompt

When performing a code review, always:

1. Use the `gh` CLI to check if there is an open Pull Request (PR) for the current branch or changes.
2. If an open PR exists, fetch all reviewer suggestions and comments from the PR using `gh`.
3. Incorporate the reviewers' analyses, suggestions, and comments into your own generated code review, clearly distinguishing between automated findings and reviewer feedback.
4. Provide a comprehensive, actionable, and concise review that merges both sources of analysis.
5. Output the review in English. Use pt-BR only for UI text if required.

- Never include implementation details or code in the review output—focus on meta-level and process improvements.
- Ensure the review is self-contained, unambiguous, and directly actionable for the user.
- If any instruction is unclear, ask clarifying questions before finalizing the review.

## Explicit Examples of Actionable Learnings and Blockers

- Missing or incorrect shell commands (e.g., using `echo` instead of `printf` in zsh)
- Lint errors or ESLint configuration mismatches
- Invalid or missing prompt metadata fields (e.g., `mode` not set to `ask`, `edit`, or `agent`)
- Shell/OS-specific issues (e.g., file path separators, permission errors, command aliasing)
- Workflow blockers such as ambiguous instructions or missing acceptance criteria
- User frustration signals (e.g., all-caps/yelling) must be flagged for prompt review

> After a code review or end-session declaration, the agent must act immediately without waiting for further user input.
