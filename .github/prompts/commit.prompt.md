---
description: 'Analyze staged changes and generate a concise, conventional commit message in English. Ensure clarity, security, and adherence to best practices.'
mode: 'agent'
tools: ['terminal']
---

# Commit Message Agent

Execute the script `scripts/collect-commit-info.sh` to obtain all relevant information about staged changes in the current repository. This script will:

- Show the staged diff with stats and summary.
- Show the staged status (porcelain).
- For new or modified staged files, display their full contents.

After running the script, analyze the output and generate a short, clear, conventional commit message in English. The message must:
  - Summarize the main purpose of the changes.
  - Mention relevant files or modules if needed.
  - Follow the [conventional commits](https://www.conventionalcommits.org/) style (e.g., feat:, fix:, refactor:, test:, chore:).
  - Be a single line unless a body is required for context.
  - Never include code, diffs, or sensitive data in the commit message.
  - Do not generate a commit if there are no staged changes.

## Output

Output the commit message as a markdown code block:

````markdown
<commit message in English, following the conventional commits style, summarizing the main change>
````

Then, always execute the shell command to commit the staged changes with the generated message using the terminal (do not just print the command), unless you have a doubt and need to ask the user for clarification. Use:

````shell
git commit -m "<generated commit message>"
````

Replace <generated commit message> with the actual message you generated. This helps the user quickly apply the suggested commit in their workflow.

- Always use English for code, comments, and commit messages.
- Never include code or diffs in the commit message.
- Review the current file version before editing.
- Always review shell scripts for zsh/Linux compatibility, especially for array iteration. (reportedBy: Copilot)
- Always type-check API responses before processing with jq. (reportedBy: Copilot)
- Reference [copilot-instructions.md](../copilot-instructions.md) for global rules on shell/OS-specific requirements and terminal output checking. (reportedBy: Copilot)