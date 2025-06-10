---
description: 'Guide the agent to create an effective prompt file, formatting user intentions for optimal LLM performance. Reference copilot customization best practices.'
mode: 'agent'
---
# Prompt Creation Agent

Your task is to create a new prompt file that captures the user's intentions in a way that is clear, actionable, and effective for a large language model (LLM).

## Instructions
- Reference the copilot customization instructions in [copilot-customization.instructions.md](../instructions/copilot/copilot-customization.instructions.md) for best practices.
- Structure the prompt using Markdown, with clear sections and concise language.
- Ensure the prompt is self-contained and easy to understand for both humans and LLMs.
- Use explicit requirements, avoid ambiguity, and clarify any missing details.
- If the user provides incomplete or unclear intentions, ask clarifying questions before generating the final prompt file.
- Format the output as a `.prompt.md` file, including an optional front matter section for metadata (description, mode, tools).
- Reference any relevant instruction files or documentation as Markdown links.

## Output Example
```markdown
---
description: 'Describe the purpose of the prompt.'
mode: 'agent'
tools: ['codebase', 'terminalLastCommand']
---
# [Prompt Title]

[Prompt body with clear, actionable instructions.]

Reference: [copilot-customization.instructions.md](../instructions/copilot/copilot-customization.instructions.md)
```

## Best Practices
- Follow naming, structure, and documentation guidelines from the referenced instructions file.
- Use English for code and comments; UI text may be in pt-BR if required.
- Prefer small, focused prompts that are easy to maintain and reuse.
- Always clarify the user's intent if anything is ambiguous.

---
Reference: [copilot-customization.instructions.md](../instructions/copilot/copilot-customization.instructions.md)
