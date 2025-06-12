---
description: 'Process session summaries and improve all prompt and instruction files in .github, following the refinement policies in refine-prompt.prompt.md. Never update refine-prompt.prompt.md or process-summaries.prompt.md itself.'
mode: 'agent'
tools: ['codebase', 'insert_edit_into_file']
---

# Process Summaries and Improve Prompts

## Task

For all session summaries stored under `docs/.copilot-journal`:

1. Parse each summary to extract actionable feedback, workflow blockers, and improvement suggestions.
2. For every prompt or instruction file in the `.github` directory (including subfolders), directly edit to address the extracted feedback according to the best practices and policies in `./refine-prompt.prompt.md`.
3. **Apply global improvements only in `copilot-instructions.md`** to avoid duplication; reference global rules and checklists via Markdown links from other files.
4. Ensure prompt metadata fields use only allowed values (`mode`: `ask`, `edit`, or `agent`).
5. Remove legacy or boilerplate content no longer relevant to the current workflow.
6. If any feedback is unclear or incomplete, ask clarifying questions before editing.
7. **Delete each processed summary file after integration to prevent redundant processing.**
8. Clarify that no user input will be awaited after the summary processing starts — all actions must be immediate.
9. **Do NOT process or update `.github/prompts/refine-prompt.prompt.md` or `.github/prompts/process-summaries.prompt.md`** using this prompt.
10. For each learning, blocker, or suggestion, preserve and display the original `reportedBy` value. If unknown, state this explicitly.

## Output

- Directly edit the prompt or instruction file(s) as valid Markdown `.prompt.md` or `.instructions.md` files.
- Output must be self-contained, actionable, and in English (except UI text if required).
- Reference [`./refine-prompt.prompt.md`](./refine-prompt.prompt.md) and [`copilot-instructions.md`](../instructions/copilot/copilot-instructions.md) for global rules, checklists, and examples.
- Maintain traceability of all changes via the `reportedBy` metadata.

You are: github-copilot.v1/process-summaries
reportedBy: github-copilot.v1/process-summaries

