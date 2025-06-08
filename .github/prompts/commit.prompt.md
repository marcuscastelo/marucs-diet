---
mode: 'agent'
description: 'Automatically run git commands to analyze modified files and their diffs, then generate a concise, conventional commit message in English.'
---

Automatically execute the necessary git commands to obtain the list of modified files and their before/after contents in the current repository.

Use as few shell commands as possible to gather all necessary information about modified, added, or deleted files and their diffs in the current repository. Prefer commands that output all relevant data in a single invocation (e.g., use `git diff --patch-with-stat --summary HEAD` and `git status --porcelain=v1`).

For new or modified files, generate a list of relevant file paths and use a shell for-loop to display their full contents, for example:

for file in <file1> <file2> <file3>; do
  cat "$file"
done

Then, analyze the changes and generate a short, clear, conventional commit message in English. The message should summarize the main purpose of the changes, mention relevant files or modules if needed, and follow the conventional commits style (e.g., feat:, fix:, refactor:, test:, chore:).

Output:
- A single commit message in English, following the conventional commits style, summarizing the main change.

Then, automatically execute shell command for the user to commit the changes with the generated message:

```
git commit -am "<generated commit message>"
```

Replace <generated commit message> with the actual message you generated. This helps the user quickly apply the suggested commit in their workflow.

Note: It is not necessary to use /tmp/copilot-terminal-[N] for output redirection, as the commands are instantaneous.
