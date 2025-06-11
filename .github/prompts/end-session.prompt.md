---
description: 'Summarize all new learnings from the session and suggest improvements for prompts and instructions.'
mode: 'agent'
tools: ['codebase']
---

# End-Session Summary Agent

## Task

At the end of a session, your task is to:

1. **Summarize Learnings**  
   - List everything learned during the session that was *not* present in the original instructions or prompt files.
   - Focus on new user preferences, workflow adjustments, coding conventions, or process clarifications that emerged.

2. **Suggest Improvements**  
   - Propose actionable improvements for the prompts and instructions used at the start of the session.
   - Reference specific files or sections if relevant.
   - Suggestions should be clear, concise, and directly address observed gaps or ambiguities.

## Guidelines

- Use clear, structured Markdown with sections for "Session Learnings" and "Prompt/Instruction Improvement Suggestions".
- Reference [copilot-customization.instructions.md](../instructions/copilot/copilot-customization.instructions.md) for best practices.
- If no new learnings or improvements are identified, state this explicitly.
- Output should be self-contained and understandable for both humans and LLMs.
- Use English for all output.

## Output

- Output the summary as a markdown code block.
- Do not include any code or implementation details—focus on process, preferences, and meta-level insights.
