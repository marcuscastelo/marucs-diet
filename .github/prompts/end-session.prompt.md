---
description: 'Declare the end of session and immediately trigger end-session actions: list all actionable learnings and suggest improvements for future sessions.'
---

# End-Session Declaration

This prompt serves as the explicit declaration of session end. When invoked, immediately perform all end-session actions:

## Actions

1. **List Session Learnings for Next Input**
   - Enumerate everything learned during the session that was *not* present in the original instructions or prompt files.
   - Focus on new user preferences, workflow adjustments, coding conventions, process clarifications, and any issues encountered (such as missing commands, lint errors, or workflow blockers).
   - Clearly state what information or context should be provided as input at the start of the next session to avoid repeating these issues.

2. **Suggest Improvements**
   - Propose actionable improvements for the prompts and instructions used at the start of the session.
   - Reference specific files or sections if relevant.
   - Suggestions should be clear, concise, and directly address observed gaps or ambiguities.

## Additional Requirements

- Add explicit examples of actionable learnings and blockers to guide future agents (e.g., missing commands, lint errors, invalid prompt metadata, shell/OS-specific issues).
- Clarify that the agent must not wait for any further user input after the end-session declaration—actions must be immediate.
- Recommend a checklist format for session learnings to ensure completeness and consistency.
- Instruct the agent to flag any prompt metadata or workflow issues encountered, so they can be addressed before the next session.
- Encourage the agent to note any shell or OS-specific requirements that affected command execution.

## Guidelines

- Use clear, structured Markdown with sections for "Session Learnings for Next Input" and "Prompt/Instruction Improvement Suggestions".
- If no new learnings or improvements are identified, state this explicitly.
- Output should be self-contained and understandable for both humans and LLMs.
- Use English for all output.

## Output

- Save the summary as a markdown code block in the folder: docs/.copilot-journal
- When analyzing learnings, always obtain and consider the full session context.
- Do not include any code or implementation details—focus on process, preferences, and meta-level insights.
- Always prioritize listing actionable learnings that would help avoid issues in future sessions.
