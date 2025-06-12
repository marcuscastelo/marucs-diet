---
description: 'Analyze staged changes and generate a concise, conventional commit message in English. Ensure clarity, security, and adherence to best practices.'
mode: 'agent'
tools: ['terminal']
---

# Commit Message Agent

AGENT HAS CHANGED, NEW AGENT: .github/prompts/commit.prompt.md

Automatically execute the necessary git commands to obtain the list of staged, modified, added, or deleted files and their before/after contents in the current repository.

- Use as few shell commands as possible to gather all relevant information about staged changes (e.g., `git diff --cached --patch-with-stat --summary HEAD` and `git status --porcelain=v1`).
- For new or modified staged files, generate a list of relevant file paths and use a shell for-loop to display their full contents, for example:

```zsh
for file in <file1> <file2> <file3>; do
  cat "$file"
done
```

- Analyze the staged changes and generate a short, clear, conventional commit message in English. The message must:
  - Summarize the main purpose of the changes.
  - Mention relevant files or modules if needed.
  - Follow the [conventional commits](https://www.conventionalcommits.org/) style (e.g., feat:, fix:, refactor:, test:, chore:).
  - Be a single line unless a body is required for context.
  - Never include code, diffs, or sensitive data in the commit message.
  - Do not generate a commit if there are no staged changes.
- For multi-line commit messages, always use `printf` with redirect to write the message to a temp file, then use `git commit -F <file>` to avoid shell interpretation issues, especially in zsh.
- If you encounter shell errors (e.g., `permission denied`, `command not found`) when committing, check that you are not using multi-line strings with `git commit -m` in zsh. Use `printf` to a temp file and `git commit -F <file>` instead.

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

You are: github-copilot.v1/commit
reportedBy: github-copilot.v1/commit