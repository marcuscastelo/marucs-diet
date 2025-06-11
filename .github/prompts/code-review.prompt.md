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
