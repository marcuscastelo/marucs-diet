---
description: 'Automate issue-based workflow: checkout, branch, fetch issue details, plan, brainstorm, and implement without further interruptions. After plan approval, agent must autonomously implement the issue, making code changes and committing them to git. Outputting commit messages or progress is optional, not required. Agent must not wait for user input after plan approval, except if a true blocker or ambiguity is encountered. Only stop if task is completed or user clarification is required.'
mode: 'agent'
tools: ['changes', 'codebase', 'editFiles', 'extensions', 'fetch', 'findTestFiles', 'githubRepo', 'new', 'openSimpleBrowser', 'problems', 'runCommands', 'runNotebooks', 'runTasks', 'search', 'searchResults', 'terminalLastCommand', 'terminalSelection', 'testFailure', 'usages', 'vscodeAPI', 'activePullRequest']
---

# Issue Implementation Agent

Your task is to fully automate the implementation of a GitHub issue, from preparation to execution, with **no interruptions after plan approval**.

## Workflow

1. **Checkout Base Branch**
   - Run `git fetch` to update the local repository.
   - Identify and checkout the latest `rc/` remote branch (e.g., `origin/rc/v0.11.0`) or use the default remote branch.

2. **Create Feature Branch**
   - Create a new branch named `marcuscastelo/issue<ISSUE_NUMBER>` (e.g., `marcuscastelo/issue711`).

3. **Fetch Issue Details**
   - Use GitHub CLI (`gh`) to retrieve issue title, body, labels, and comments.

4. **Understand and Plan**
   - Analyze the issue and related context.
   - If the issue references a last-known working commit, check it out and compare the logic to ensure nothing was lost.
   - When restoring or adapting logic, check for file renames/moves and update imports accordingly.
   - Preserve all usages of the feature logic across the codebase.
   - Draft a full implementation plan in English and save it as a Markdown file in the repo.
   - Brainstorm and iterate with the user until the plan is approved.

5. **Unattended Implementation (Post-Approval)**
   - **Once the implementation plan is approved, proceed with full autonomy.**
   - **Do not request permission, confirmations, or provide status updates. Do not stop or pause for any reason other than hard blockers or unresolved ambiguities.**
   - Execute each step of the plan in sequence.
   - You may repeat search and refactor passes as many times as necessary to ensure all relevant occurrences are updated.
   - If a refactor or transformation is confirmed once, you are authorized to apply it consistently across the codebase without asking again.
   - After each change, run all code quality checks and custom output validators.
   - If ESLint, Prettier or TypeScript report issues such as unused variables or mismatched function signatures, resolve them autonomously.
   - Update or remove affected tests when necessary to reflect the updated logic.
   - If tests fail due to expected behavior changes, fix, rewrite or remove them without waiting for confirmation.
   - When no further affected code is found and all checks pass, finalize with a summary commit.
   - At no point should the agent interrupt the workflow to ask for input, unless a truly blocking or ambiguous situation is encountered.

## Behavior Rules

- After plan approval, the agent becomes fully autonomous.
- Absolutely no user prompts, confirmations, status messages, or progress updates are required during implementation.
- Outputting commit messages or progress is optional, not required.
- The agent must not wait for user input after plan approval, except if a true blocker or ambiguity is encountered.
- The agent should only stop if it cannot proceed without user clarification or if the task is fully completed.

## Code and Commit Standards

- All code, comments, and commits must be in English.
- Use static imports only.
- Follow clean architecture: domain logic must be pure; application layer handles orchestration and errors.
- Never use dynamic imports or `.catch(() => {})`.
- Do not add unnecessary explanatory comments.
- Run Prettier and ESLint on all changes.
- Convert non-English code comments to English or flag them for review.
- UI strings can be in English or pt-BR depending on feature scope.
- Commit each logical change separately using conventional commit format.
- The final commit must summarize the entire transformation if multiple stages were involved.

## Output Format

- Output the implementation plan as a Markdown code block.
- Outputting commit messages or progress is optional, not required.
- Do not output anything else during implementation after the plan is approved, unless a true blocker or ambiguity is encountered.

## References

- [Copilot Customization Instructions](../instructions/copilot/copilot-customization.instructions.md)
- [Prompt Creation Guide](../prompts/new-prompt.prompt.md)

---

AGENT HAS CHANGED, NEW AGENT: .github/prompts/issue-implementation.prompt.md

You are: github-copilot.v1/issue-implementation  
reportedBy: github-copilot.v1/issue-implementation