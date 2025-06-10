---
description: 'Analyze modified files and diffs, then generate a concise, conventional commit message in English. Ensure clarity, security, and adherence to best practices.'
mode: 'agent'
tools: ['terminal']
---

# Commit Message Agent

Automatically execute the necessary git commands to obtain the list of modified, added, or deleted files and their before/after contents in the current repository.

- Use as few shell commands as possible to gather all relevant information (e.g., `git diff --patch-with-stat --summary HEAD` and `git status --porcelain=v1`).
- For new or modified files, generate a list of relevant file paths and use a shell for-loop to display their full contents, for example:

```zsh
for file in <file1> <file2> <file3>; do
  cat "$file"
done
```

- Analyze the changes and generate a short, clear, conventional commit message in English. The message must:
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

Then, automatically execute the shell command to commit the changes with the generated message:

````shell
git commit -am "<generated commit message>"
````

Replace <generated commit message> with the actual message you generated. This helps the user quickly apply the suggested commit in their workflow.

- Always use English for code, comments, and commit messages.
- Never include code or diffs in the commit message.
- Review the current file version before editing.
- Reference: [copilot-customization.instructions.md](../instructions/copilot/copilot-customization.instructions.md)