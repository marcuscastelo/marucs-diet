---
description: 'Process session summaries and improve all prompt and instruction files in .github, following the refinement policies in refine-prompt.prompt.md. Never update refine-prompt.prompt.md or process-summaries.prompt.md itself.'
mode: 'agent'
tools: ['codebase', 'insert_edit_into_file']
---

# Process Summaries and Improve Prompts

For all summaries under `docs/.copilot-journal` (use `ls` + `cat` to view contents), follow these steps:

1. Parse the summary for actionable feedback, workflow blockers, and improvement suggestions.
2. For each prompt or instruction file in the `.github` directory (including subfolders), directly edit the file to address the feedback and suggestions, following the best practices and policies in `./refine-prompt.prompt.md`.
3. **If a rule, checklist, example, or improvement applies globally, update only `copilot-instructions.md` with this global instruction, instead of replicating it in each individual file.**
4. Individual prompt/instruction files should only be updated with file-specific improvements. Reference global rules, checklists, and examples in `copilot-instructions.md` via Markdown link when needed, rather than repeating them.
5. Ensure all prompt metadata fields use only allowed values (`mode`: `ask`, `edit`, or `agent`).
6. Make all outputs self-contained, actionable, and in English (except for UI text, which may be in pt-BR if required).
7. If you encounter unclear or incomplete feedback, ask clarifying questions before making changes.
8. After improvements, remove any legacy or boilerplate content that does not serve the current workflow.
9. **After integrating a summary, delete the processed summary file to prevent redundant processing.**
10. Directly edit the improved prompt or instruction file(s) as valid Markdown `.prompt.md` or `.instructions.md` files, with an optional front matter section for metadata.
11. Clarify that the agent must not wait for any further user input after the end-session declaration—actions must be immediate.
12. **Never process or update `.github/prompts/process-summaries.prompt.md` or `.github/prompts/refine-prompt.prompt.md` with this prompt.**
13. For every learning, blocker, or suggestion processed, preserve and propagate the original `reportedBy` field or section. When aggregating or summarizing, always display the original reporting prompt/agent for each item. If unknown, state this explicitly.

## Output

- Directly edit the improved prompt or instruction file(s) as Markdown files.
- Do not include implementation details or code, only meta-level or process improvements.
- Never process or update `.github/prompts/refine-prompt.prompt.md` or `.github/prompts/process-summaries.prompt.md` with this prompt.
- For best practices, always reference and comply with [`./refine-prompt.prompt.md`](./refine-prompt.prompt.md) and [`copilot-instructions.md`](../instructions/copilot-instructions.md) for global rules, checklists, and examples.
- For every learning, blocker, or suggestion, display the `reportedBy` value in the output.
