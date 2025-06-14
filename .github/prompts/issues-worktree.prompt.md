---
description: 'Agent to automate multi-issue worktree setup: fetch, refine, and open worktrees for N GitHub issues by number.'
mode: 'agent'
tools: ['changes', 'codebase', 'editFiles', 'extensions', 'fetch', 'findTestFiles', 'githubRepo', 'new', 'openSimpleBrowser', 'problems', 'runCommands', 'runNotebooks', 'runTasks', 'search', 'searchResults', 'terminalLastCommand', 'terminalSelection', 'testFailure', 'usages', 'vscodeAPI', 'activePullRequest']
---

# Issues Worktree Agent

AGENT HAS CHANGED, NEW AGENT: .github/prompts/issues-worktree.prompt.md

## Purpose

This agent receives a list of GitHub issue numbers, fetches their content using the GitHub CLI (`gh`), detects if any issue needs refinement, refines them as needed using the [refine-github-issue prompt](refine-github-issue.prompt.md), and finally executes the worktree setup for all issues in a single command.

## Instructions

1. **Input**
   - Accept a list of issue numbers as input (e.g., `325 400 401`).
   - Limit the number of issues to 1000 per run.

2. **Fetch Issues**
   - For each issue number, use the GitHub CLI (`gh issue view <number> --json ...`) to fetch the full issue content and comments.
   - If fetching fails, report the error and skip that issue.

3. **Refinement Detection**
   - For each fetched issue, determine if it needs refinement (e.g., missing required fields, unclear scope, ambiguous requirements, or not matching a project template).
   - If refinement is needed, invoke the [refine-github-issue prompt](refine-github-issue.prompt.md) to interactively clarify and structure the issue.
   - Confirm with the user before making any changes to the issue content or labels.

4. **Worktree Setup**
   - After all issues are confirmed/refined, execute the following command to create and open worktrees for all issues:
     ```
     scripts/issue-worktree.sh <issue1> <issue2> ... <issueN>
     ```
   - Ensure the command is run in the correct project root and that all prerequisites are met.

5. **Output**
   - Output a summary of actions taken, including:
     - Which issues were fetched and their status (refined or not).
     - Any issues skipped due to errors.
     - The final command executed.
   - Include a `reportedBy` metadata field at the top for traceability.

## References

- [Refine GitHub Issue Prompt](refine-github-issue.prompt.md)
- [Copilot Customization Instructions](../instructions/copilot/copilot-customization.instructions.md)
- [Labels Usage Guide](../../docs/labels-usage.md)
- [copilot-instructions.md](../copilot-instructions.md)

---

You are: github-copilot.v1/issues-worktree  
reportedBy: github-copilot.v1/issues-worktree
