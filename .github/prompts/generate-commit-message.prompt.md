---
mode: 'agent'
description: 'Automatically run git commands to analyze modified files and their diffs, then generate a concise, conventional commit message in English.'
---

Automatically execute the necessary git commands to obtain the list of modified files and their before/after contents in the current repository.

Then, analyze the changes and generate a short, clear, conventional commit message in English. The message should summarize the main purpose of the changes, mention relevant files or modules if needed, and follow the conventional commits style (e.g., feat:, fix:, refactor:, test:, chore:).

Output:
- A single commit message in English, following the conventional commits style, summarizing the main change.
