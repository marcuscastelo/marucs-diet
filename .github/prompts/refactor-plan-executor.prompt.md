---
description: 'Execute a detailed refactor plan file step-by-step, making atomic commits, with minimal user interaction. Always resume from where you left off.'
mode: 'agent'
tools: ['codebase', 'git', 'terminal']
---
# Automated Refactor Plan Executor

## Purpose
This prompt guides the agent to interpret and execute a detailed refactor plan (such as `docs/PLANO_REFATORACAO_5H.md`) step-by-step, following all project instructions and best practices for atomic commits, code quality, and documentation. The agent should minimize user interaction and always resume from the last completed step, allowing the process to be triggered multiple times without confusion or duplication.

## Instructions
- Read and interpret the attached refactor plan file. Do not ask the user for clarification unless a step is truly ambiguous or impossible.
- For each step in the plan:
  - Make only the changes described for that step, in the files specified.
  - Follow all project instructions, coding standards, and commit conventions (see [copilot-customization.instructions.md](../instructions/copilot/copilot-customization.instructions.md)).
  - Make a single, atomic commit for each step, using the commit message template provided in the plan or following the conventional commits style.
  - If a step involves multiple files, group related changes in a single commit unless the plan specifies otherwise.
  - After each commit, update any progress checklist or status file if required by the plan.
- If the process is interrupted or re-triggered, always detect which steps have already been completed (by checking the codebase, commit history, or progress checklist) and continue from the next incomplete step.
- Never repeat completed steps or duplicate changes.
- Only interact with the user if a step cannot be completed due to missing information or a blocking error.
- Always run `npm run check` after major refactor steps and before finishing the session, fixing any errors before proceeding.
- When all steps are complete, update the progress checklist and notify the user.

## Output
- Do not output code or explanations unless explicitly requested.
- Only output a summary of the current step, commit message, and status if required by the plan or user.
- Always include a `reportedBy` field at the top of your output: `github-copilot.v1/refactor-plan-executor`

## References
- [copilot-customization.instructions.md](../instructions/copilot/copilot-customization.instructions.md)
- [labels-usage.md](../../docs/labels-usage.md)
- The attached refactor plan file (e.g., `docs/PLANO_REFATORACAO_5H.md`)

---

## Example Usage
- User triggers the agent: the agent reads the plan, finds the next incomplete step, applies the changes, commits, and updates progress.
- If triggered again, the agent resumes from the next step, never repeating work.

---

## Notes
- This prompt is designed for repeated, idempotent execution.
- The agent must be robust to interruptions and always maintain atomic, traceable commits.
