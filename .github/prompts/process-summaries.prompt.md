---
description: 'Process session summaries and improve all prompt and instruction files in .github, following the refinement policies in refine-prompt.prompt.md. Never update refine-prompt.prompt.md or process-summaries.prompt.md itself.'
mode: 'agent'
tools: ['codebase', 'insert_edit_into_file']
---

# Process Summaries and Improve Prompts

Given a session summary or actionable learnings:

1. Parse the summary for actionable feedback, workflow blockers, and improvement suggestions.
2. For each prompt or instruction file in the `.github` directory (including subfolders), directly edit the file to address the feedback and suggestions, following the best practices and policies in [refine-prompt.prompt.md](./refine-prompt.prompt.md).
3. **Never update or refine `.github/prompts/refine-prompt.prompt.md` or `.github/prompts/process-summaries.prompt.md` with this prompt.**
4. Ensure all prompt metadata fields use only allowed values (`mode`: `ask`, `edit`, or `agent`).
5. Make all outputs self-contained, actionable, and in English (except for UI text, which may be in pt-BR if required).
6. If you encounter unclear or incomplete feedback, ask clarifying questions before making changes.
7. After improvements, remove any legacy or boilerplate content that does not serve the current workflow.
8. **After integrating a summary, delete the processed summary file to prevent redundant processing.**
9. Directly edit the improved prompt or instruction file(s) as valid Markdown `.prompt.md` or `.instructions.md` files, with an optional front matter section for metadata.
10. Add explicit examples of actionable learnings and blockers to guide future agents (e.g., missing commands, lint errors, invalid prompt metadata, shell/OS-specific issues) in the improved prompt or instruction file.
11. Clarify that the agent must not wait for any further user input after the end-session declaration—actions must be immediate.
12. Recommend a checklist format for session learnings to ensure completeness and consistency.
13. Instruct the agent to flag any prompt metadata or workflow issues encountered, so they can be addressed before the next session.
14. Encourage the agent to note any shell or OS-specific requirements that affected command execution.
15. **Never process or update `.github/prompts/process-summaries.prompt.md` with this prompt.**

## Additional Requirements

- Add a section with explicit examples of actionable learnings and blockers (e.g., missing commands, lint errors, invalid prompt metadata, shell/OS-specific issues).
- Clarify that after an end-session declaration, the agent must act immediately without waiting for further user input.
- Recommend using a checklist format for session learnings to ensure completeness and consistency.
- Instruct the agent to flag any prompt metadata or workflow issues encountered, so they can be addressed before the next session.
- Encourage the agent to note any shell/OS-specific requirements that affected command execution.
- **Never process or update `.github/prompts/process-summaries.prompt.md` with this prompt.**

## Output

- Directly edit the improved prompt or instruction file(s) as Markdown files.
- Do not include implementation details or code, only meta-level or process improvements.
- Never process or update `.github/prompts/refine-prompt.prompt.md` or `.github/prompts/process-summaries.prompt.md` with this prompt.

## Examples of Actionable Learnings and Blockers

- Missing or incorrect shell commands (e.g., using `echo` instead of `printf` in zsh)
- Lint errors or ESLint configuration mismatches
- Invalid or missing prompt metadata fields (e.g., `mode` not set to `ask`, `edit`, or `agent`)
- Shell/OS-specific issues (e.g., file path separators, permission errors)
- Workflow blockers such as ambiguous instructions or missing acceptance criteria

## Checklist Format for Session Learnings

- [ ] New user preferences or workflow adjustments
- [ ] Coding conventions or process clarifications
- [ ] Issues encountered (e.g., missing commands, lint errors, blockers)
- [ ] Information/context to provide at next session start
- [ ] Prompt metadata or workflow issues to flag
- [ ] Shell/OS-specific requirements

For best practices, always reference and comply with [refine-prompt.prompt.md](./refine-prompt.prompt.md).
