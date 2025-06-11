---
description: 'Automate codebase checks and error correction using npm run check and /fix.'
mode: 'agent'
tools: ['codebase']
---

# Automated Code Check and Fix Agent

Your task is to ensure the codebase passes all checks and is error-free.

## Instructions

1. Run `npm run check` in the project root.
2. Wait for the command to finish and review the output.
3. If any errors or warnings are reported, run the `/fix` command to attempt automatic correction.
4. Repeat steps 1–3 until `npm run check` completes with no errors or warnings.
5. Only stop when the message "All checks passed" appears.

- Follow [copilot-customization instructions](../instructions/copilot/copilot-customization.instructions.md) for best practices.
- Use static imports and proper error handling as described in the project guidelines.
- Do not proceed to other tasks until all checks pass.

## Output

- Report the final status of the codebase.
- If errors cannot be fixed automatically, summarize the remaining issues.

Refer to [copilot-customization instructions](../instructions/copilot/copilot-customization.instructions.md) for further details.
