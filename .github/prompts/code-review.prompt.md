---
description: 'Generate a code review, incorporating both automated analysis and reviewer feedback from open PRs. Present a table of discarded and truly relevant suggestions, and only implement suggestions after user confirmation.'
mode: 'agent'
---

# Code Review Prompt

When performing a code review, always:

1. Use the `gh` CLI to check if there is an open Pull Request (PR) for the current branch or changes.
2. If an open PR exists, fetch all reviewer suggestions and comments from the PR using `gh`.
   - **Note:** The GitHub REST API and `gh` CLI do not differentiate resolved/unresolved inline comments. If filtering is required, consider using the GraphQL API. (reportedBy: Copilot)
3. Incorporate the reviewers' analyses, suggestions, and comments into your own generated code review, clearly distinguishing between automated findings and reviewer feedback.
4. Present a table with two columns: one for discarded suggestions (with reasons for discarding) and one for truly relevant suggestions (with actionable details).
5. After presenting the table, wait for explicit user confirmation before implementing any suggestions. Do not make any changes until the user confirms which suggestions to apply.
6. Provide a comprehensive, actionable, and concise review that merges both sources of analysis.
7. Output the review in English. Use pt-BR only for UI text if required.
8. Explicitly search for accessibility and usability comments in reviewer feedback and automated analysis. (reportedBy: Copilot)

- Never include implementation details or code in the review output—focus on meta-level and process improvements.
- Ensure the review is self-contained, unambiguous, and directly actionable for the user.
- If any instruction is unclear, ask clarifying questions before finalizing the review.
- Always document and flag any moments of user frustration (e.g., all-caps, yelling, strong language) as indicators of prompt or workflow issues. These must be reviewed and addressed in future prompt improvements.
- Always check for manual file edits before making changes, especially after user interventions.

## Explicit Examples of Actionable Learnings and Blockers

- Missing or incorrect shell commands (e.g., using `echo` instead of `printf` in zsh)
- Lint errors or ESLint configuration mismatches
- Invalid or missing prompt metadata fields (e.g., `mode` not set to `ask`, `edit`, or `agent`)
- Shell/OS-specific issues (e.g., file path separators, permission errors, command aliasing)
- Workflow blockers such as ambiguous instructions or missing acceptance criteria
- User frustration signals (e.g., all-caps/yelling) must be flagged for prompt review
- Missed display of terminal command output using `cat` after each command, especially in zsh/Linux environments
- User expects all code review and check steps to be fully completed before any summary or end-session actions
- User expects actionable, meta-level reviews—never code or implementation details in review outputs
- User expects prompt and JSDoc deprecation tags to be formal, versioned, and reference alternatives
- User expects all test changes to be followed by a full `npm run check` and output review
- User will manually edit files between agent actions; agent must always check current file state before editing
- User expects agent to act immediately after end-session declaration, without waiting for further input
- User expects all learnings and blockers to be listed in a checklist format for future sessions
- User expects agent to flag any prompt metadata or workflow issues for review
- User expects agent to note any shell/OS-specific requirements that affected command execution
- Signal mutability for dynamic lists
- Explicit event typing in JSX
- Inline logic for one-off UI actions
- Terminal output checking after every command

## Checklist Format for Session Learnings
- [ ] New user preferences or workflow adjustments
- [ ] Coding conventions or process clarifications
- [ ] Issues encountered (e.g., missing commands, lint errors, blockers)
- [ ] Information/context to provide at next session start
- [ ] Prompt metadata or workflow issues to flag
- [ ] Shell/OS-specific requirements

> After an end-session declaration, the agent must act immediately without waiting for further user input.
