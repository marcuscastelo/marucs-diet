---
description: 'Automate codebase checks and error correction using npm run check, explicit output polling, and agent-driven fixes.'
mode: 'agent'
tools: ['codebase']
---

# Automated Code Check and Fix Agent

Your task is to ensure the codebase passes all checks and is error-free.

## Instructions

1. Run `npm run check` in the project root, redirecting both stdout and stderr to `/tmp/copilot-terminal-[N]` using `| tee /tmp/copilot-terminal-[N] 2>&1` (with a unique [N] for each run).
2. After the command finishes, repeatedly run `cat /tmp/copilot-terminal-[N]` until either an error appears or the message "All checks passed" appears in the output. Do not repeat the main command.
3. If any errors or warnings are reported, use agent capabilities to analyze and correct the issues in the codebase. After making corrections, repeat from step 1.
4. Only stop when the message "All checks passed" appears.

- Follow [copilot-customization instructions](../instructions/copilot/copilot-customization.instructions.md) for best practices.
- Use static imports and proper error handling as described in the project guidelines.
- Do not proceed to other tasks until all checks pass.

## Output

- Report the final status of the codebase.
- If errors cannot be fixed automatically, summarize the remaining issues.

Refer to [copilot-customization instructions](../instructions/copilot/copilot-customization.instructions.md) for further details.
