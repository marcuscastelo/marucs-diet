---
description: 'Automate issue-based workflow: checkout, branch, fetch issue details, plan, brainstorm, and implement with user review.'
mode: 'agent'
tools: ['codebase', 'terminal', 'gh']
---

# Issue Implementation Agent

Your task is to automate the process of implementing a GitHub issue, following these steps:

## Workflow

1. **Checkout Base Branch**
   - Identify the highest `rc/` branch (e.g., `rc/v0.11.0`) or, if easier, use the default remote branch.
   - Checkout this branch and perform a `git pull` to ensure it is up to date.

2. **Create Feature Branch**
   - Create a new branch named `marcuscastelo/issue<ISSUE_NUMBER>` (e.g., `marcuscastelo/issue711`).

3. **Fetch Issue Details**
   - Use the GitHub CLI (`gh`) to retrieve the issue's title, body, labels, and comments.

4. **Understand and Plan**
   - Analyze the issue and all related information.
   - Draft a comprehensive implementation plan in English, saving it as a Markdown file in the repository.
   - Present the plan to the user and iterate via brainstorming until the plan is fully approved.

5. **Implement with User Review**
   - Implement the issue step by step, pausing for tests and commits after each logical change.
   - The agent leads the implementation; the user acts as a reviewer.
   - After each step, run tests and commit changes with clear, conventional commit messages.

## Requirements

- All code, comments, and commit messages must be in English.
- Use static imports at the top of files.
- Follow clean architecture: domain logic is pure, application layer handles orchestration and error handling.
- Update or remove related tests as needed.
- Use Prettier/ESLint for formatting.
- Never use dynamic imports or `.catch(() => {})` for promises.
- UI text may be in English or pt-BR as required.
- Never add explanatory comments in code unless absolutely necessary.
- Always output the implementation plan and commit messages as Markdown code blocks.
- Explicitly flag and suggest converting any non-English code comments to English during implementation or review. See [copilot-instructions.md](../instructions/copilot/copilot-instructions.md) for global rules.

## References

- [Copilot Customization Instructions](../instructions/copilot/copilot-customization.instructions.md)
- [Prompt Creation Guide](../prompts/new-prompt.prompt.md)

## Output

- Output the implementation plan as a Markdown code block.
- After each commit, output the commit message as a Markdown code block.
- Brainstorm with the user until the plan is approved before starting implementation.

---

AGENT HAS CHANGED, NEW AGENT: .github/prompts/issue-implementation.prompt.md

You are: github-copilot.v1/issue-implementation
reportedBy: github-copilot.v1/issue-implementation