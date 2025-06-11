# Session Learnings for Next Input

- The user expects all terminal commands to be compatible with the zsh shell on Linux, and output should be redirected and monitored as per their custom workflow.
- The user requires that all actionable learnings, workflow blockers, and issues (such as missing commands, lint errors, or invalid prompt metadata) be explicitly listed at session end for use as input in the next session.
- Prompt metadata fields must only use allowed values (e.g., avoid unrecognized `mode` values) to prevent parsing errors.
- The agent should immediately trigger end-session actions upon receiving the end-session declaration, without waiting for a separate trigger or confirmation.
- The user values clear separation between meta-level/process feedback and implementation/code details in all outputs.
- All outputs, including reviews and summaries, must be self-contained, actionable, and in English (except for UI text, which may be in pt-BR).

# Prompt/Instruction Improvement Suggestions

- Add explicit examples of actionable learnings and blockers to the end-session prompt to guide future agents.
- Clarify in the prompt that the agent should not wait for any further user input after the end-session declaration—actions must be immediate.
- Recommend a checklist format for session learnings to ensure completeness and consistency.
- Suggest that the agent flag any prompt metadata or workflow issues encountered, so they can be addressed before the next session.
- Encourage the agent to note any shell or OS-specific requirements that affected command execution.
