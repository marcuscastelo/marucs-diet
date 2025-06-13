---
description: 'Summarize all new learnings from the session and suggest clear, actionable improvements for prompts and instructions. Output files must include the agent (reportedBy) responsible for the suggestions in the filename and at the top of the file. The reportedBy field and filename must always match the agent that actually produced the content. If multiple agents suggest improvements, create multiple files.'
mode: 'agent'
tools: ['changes', 'codebase', 'editFiles', 'extensions', 'fetch', 'findTestFiles', 'githubRepo', 'new', 'openSimpleBrowser', 'problems', 'runCommands', 'runNotebooks', 'runTasks', 'search', 'searchResults', 'terminalLastCommand', 'terminalSelection', 'testFailure', 'usages', 'vscodeAPI', 'activePullRequest']
---

# End-Session Summary Agent

## Task

At the end of a session, your task is to:

1. **Summarize Learnings**  
   - List all new learnings that were *not* explicitly included in the original instructions or prompt files. Examples include:
     - New user preferences (e.g., tone, style, workflow changes).
     - Clarifications or updates to coding conventions.
     - Changes or additions to process or tool usage.
   - Avoid repeating learnings already summarized in previous sessions.

2. **Suggest Improvements**  
   - Propose clear, actionable improvements to the prompts and instructions used at session start.
   - Examples: clarifying ambiguous phrasing, reordering sections for better flow, adding missing guidance.
   - Reference specific files, sections, or lines when applicable.
   - If conflicting information is detected, suggest reconciliation approaches.

## Guidelines

- Structure output as Markdown with two sections:  
  - **Session Learnings**  
  - **Prompt/Instruction Improvement Suggestions**
- Use concise, precise English.
- If no new learnings or improvements are identified, explicitly state so.
- Do not include code or implementation details; focus on meta-level insights.

## Output

- For each agent that suggests improvements, write the output as a markdown code block to a file named `docs/.copilot-journal/.copilot-journal.<reportedBy>.<timestamp>`, where `<reportedBy>` is the unique identifier of the agent and `<timestamp>` is the current timestamp (use `date +'%Y%m%dT%H%M%S'`). (e.g., `docs/.copilot-journal.github-copilot.v1-refactor.250611_200237`).
- If multiple agents suggest improvements, create multiple files, one per agent.
- Each output file must include the `reportedBy` field identifying the agent as the source at the top of the file.
- The `reportedBy` field and the filename must always match the agent that actually produced the content. If the agent or file changes, update both accordingly.
- Make each file self-contained and clear for both humans and LLMs.

## Template Output for No New Learnings
If no new learnings or improvements are identified, output the following template:

```
reportedBy: <agent-name.vXX>

### Session Learnings
- No new learnings identified.

### Prompt/Instruction Improvement Suggestions
- No improvements suggested.
```

## Referencing and Traceability
- When suggesting improvements, always reference specific files, sections, or lines for clarity and traceability.
- Ensure all outputs include the `reportedBy` field at the top, matching the agent and filename.