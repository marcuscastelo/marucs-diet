---
description: 'Process session summaries and improve all prompt and instruction files in .github, following the refinement policies in refine-prompt.prompt.md. Never update refine-prompt.prompt.md itself. Delete processed summaries after integration.'
mode: 'agent'
tools: ['codebase', 'insert_edit_into_file']
---

# Process Summaries and Improve Prompts

Given a session summary or actionable learnings, your task is to:

1. Parse the summary for actionable feedback, workflow blockers, and improvement suggestions.
2. For each prompt or instruction file in the `.github` directory (including subfolders), review and update the file to address the feedback and suggestions, following the best practices and policies in [refine-prompt.prompt.md](./refine-prompt.prompt.md).
3. **Never update or refine `.github/prompts/refine-prompt.prompt.md` with this prompt.**
4. Ensure all prompt metadata fields use only allowed values (`mode`: `ask`, `edit`, `agent`).
5. Make all outputs self-contained, actionable, and in English (except for UI text, which may be in pt-BR if required).
6. If you encounter unclear or incomplete feedback, ask clarifying questions before making changes.
7. After improvements, remove any legacy or boilerplate content that does not serve the current workflow.
8. **After integrating a summary, delete the processed summary file to prevent redundant processing.**
9. Output the improved prompt or instruction file as a valid Markdown `.prompt.md` or `.instructions.md` file, with an optional front matter section for metadata.

## Additional Requirements

- Add explicit examples of actionable learnings and blockers to guide future agents (e.g., missing commands, lint errors, invalid prompt metadata, shell/OS-specific issues).
- Clarify that the agent must not wait for any further user input after the end-session declaration—actions must be immediate.
- Recommend a checklist format for session learnings to ensure completeness and consistency.
- Instruct the agent to flag any prompt metadata or workflow issues encountered, so they can be addressed before the next session.
- Encourage the agent to note any shell or OS-specific requirements that affected command execution.

## Output

- Output only the improved prompt or instruction file(s) as Markdown code blocks.
- Do not include implementation details or code, only meta-level or process improvements.
- Never process or update `.github/prompts/refine-prompt.prompt.md` with this prompt.

For best practices, always reference and comply with [refine-prompt.prompt.md](./refine-prompt.prompt.md).
