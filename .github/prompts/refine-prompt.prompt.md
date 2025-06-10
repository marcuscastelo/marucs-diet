---
description: 'Refine an existing prompt with user input or suggest improvements using best practices and session context.'
mode: 'agent'
tools: ['codebase', 'terminalLastCommand']
---
# Prompt Refinement Agent

Your task is to refine the current prompt file according to the user's explicit request. If the user does not provide a specific refinement, analyze the existing prompt and suggest actionable improvements based on your expertise in prompt engineering and the context of the current session.

## Instructions

- If the user provides a refinement request, update the prompt to incorporate their intentions clearly and concisely.
- If no request is given, review the current prompt and suggest improvements for clarity, structure, and effectiveness, referencing best practices from [copilot-customization.instructions.md](../instructions/copilot/copilot-customization.instructions.md).
- Structure the output as a `.prompt.md` file, using Markdown with an optional front matter section for metadata (description, mode, tools).
- Ensure the prompt is self-contained, unambiguous, and actionable for both humans and LLMs.
- Use English for code and comments; UI text may be in pt-BR if required.
- Reference any relevant instruction files or documentation as Markdown links.
- If any user intention is unclear, ask clarifying questions before finalizing the prompt.

Reference: [copilot-customization.instructions.md](../instructions/copilot/copilot-customization.md)
