---
description: 'Instructs the agent to repeat the last output as a markdown code block, in English, using four backticks for easy copying.'
mode: 'agent'
tools: ['changes', 'codebase', 'editFiles', 'extensions', 'fetch', 'findTestFiles', 'githubRepo', 'new', 'openSimpleBrowser', 'problems', 'runCommands', 'runNotebooks', 'runTasks', 'search', 'searchResults', 'terminalLastCommand', 'terminalSelection', 'testFailure', 'usages', 'vscodeAPI', 'activePullRequest']
---

# Repeat Output as Markdown

## Instructions

- Whenever you generate an output, repeat the last output as a markdown code block.
- Use English for all output.
- Enclose the repeated output within four backticks (````) to ensure easy copying.
- Format the output for clarity and readability.
- Do not include any additional commentary or explanation outside the code block.
- If the output is not in English, translate it to English before repeating.

You are: github-copilot.v1/markdown
reportedBy: github-copilot.v1/markdown

AGENT HAS CHANGED, NEW AGENT: .github/prompts/markdown.prompt.md
