---
description: 'Declare the end of session and immediately trigger end-session actions: list all actionable learnings and suggest improvements for future sessions. Each summary, suggestion, or learning must be attributed to the agent or prompt that reported it (e.g., fix-prompt, process-summaries, end-session, etc.).'
---

# End-Session Declaration

This prompt is the explicit declaration of session end. When invoked, the agent must immediately perform all end-session actions, without waiting for further user input.

## Actions

1. **Check for Empty Session**
   - Before generating or saving any summary, the agent must check if there are any new actionable learnings, blockers, or suggestions for the session.
   - If the session is empty (i.e., no new actionable learnings, blockers, or suggestions), the agent must **not** create or save a summary file.
   - Instead, the agent must output a clear message: `No new learnings or improvements identified for this session. No summary file was created.`
   - The agent must not output a summary file or any other file in this case.

2. **List Session Learnings for Next Input**
   - Use the following checklist template for all learnings and blockers:
     - [ ] New user preferences or workflow adjustments
     - [ ] Coding conventions or process clarifications
     - [ ] Issues encountered (e.g., missing commands, lint errors, blockers)
     - [ ] Information/context to provide at next session start
     - [ ] Prompt metadata or workflow issues to flag
     - [ ] Shell/OS-specific requirements
   - For each learning, blocker, or suggestion, clearly attribute which prompt or agent reported it (e.g., fix-prompt, process-summaries, end-session, Copilot, GPT-4, Human, etc.) using a `reportedBy` field or section.
   - When aggregating or summarizing, always use and display the original `reportedBy` value for each item, not just the current summarizing agent. If the original reporting prompt/agent is unknown, state this explicitly.
   - Enumerate everything learned during the session that was *not* present in the original instructions or prompt files.
   - Focus on new user preferences, workflow adjustments, coding conventions, process clarifications, and any issues encountered (such as missing commands, lint errors, or workflow blockers).
   - Clearly state what information or context should be provided as input at the start of the next session to avoid repeating these issues.
   - Use a checklist format for all learnings and blockers, grouped or tagged by reporting prompt/agent.

3. **Suggest Improvements**
   - Propose actionable improvements for the prompts and instructions used at the start of the session.
   - Reference specific files or sections if relevant.
   - Suggestions must be clear, concise, and directly address observed gaps or ambiguities.
   - Attribute each suggestion to the prompt or agent that reported it using a `reportedBy` field or section.

## Additional Requirements

- Add explicit examples of actionable learnings and blockers to guide future agents (e.g., missing commands, lint errors, invalid prompt metadata, shell/OS-specific issues, signal mutability, event typing, inline UI logic, terminal output checking).
- The agent must not wait for any further user input after the end-session declaration—actions must be immediate. (reportedBy: Copilot)
- Instruct the agent to flag any prompt metadata or workflow issues encountered, so they can be addressed before the next session.
- Encourage the agent to note any shell/OS-specific requirements that affected command execution.
- Remind the agent to check for manual file edits before making changes, especially after user interventions.
- Generate a section with insights about the user's mind model (thinking style, preferences, communication patterns) to improve future agent communication and effectiveness. Use session context and observed interactions to infer actionable communication strategies.
- Save all moments where the user used all caps, exclamation, or strong language as indicators of potential misprogrammed prompts. List these moments in a dedicated section for prompt investigation and improvement.
- In all output sections, clearly indicate which prompt or agent reported each item using the `reportedBy` field or section. If the original reporting prompt/agent is unknown, state this explicitly.

## Explicit Examples of Actionable Learnings and Blockers

- Missing or incorrect shell commands (e.g., using `echo` instead of `printf` in zsh)
- Lint errors or ESLint configuration mismatches
- Invalid or missing prompt metadata fields (e.g., `mode` not set to `ask`, `edit`, or `agent`)
- Shell/OS-specific issues (e.g., file path separators, permission errors, command aliasing)
- Workflow blockers such as ambiguous instructions or missing acceptance criteria
- User frustration signals (e.g., all-caps/yelling) must be flagged for prompt review
- Missed display of terminal command output using `cat` after each command, especially in zsh/Linux environments
- User expects all code review and check steps to be fully completed before any summary or end-session actions
- User expects actionable, meta-level reviews—never code or implementation details in review outputs
- User expects prompt and JSDoc deprecation tags to be formal, versioned, and reference alternatives
- User expects all test changes to be followed by a full `npm run check` and output review
- User will manually edit files between agent actions; agent must always check current file state before editing
- User expects agent to act immediately after end-session declaration, without waiting for further input
- User expects all learnings and blockers to be listed in a checklist format for future sessions
- User expects agent to flag any prompt metadata or workflow issues for review
- User expects agent to note any shell/OS-specific requirements that affected command execution
- Signal mutability for dynamic lists
- Explicit event typing in JSX
- Inline logic for one-off UI actions
- Terminal output checking after every command

## Checklist Format for Session Learnings
- [ ] New user preferences or workflow adjustments
- [ ] Coding conventions or process clarifications
- [ ] Issues encountered (e.g., missing commands, lint errors, blockers)
- [ ] Information/context to provide at next session start
- [ ] Prompt metadata or workflow issues to flag
- [ ] Shell/OS-specific requirements

> After an end-session declaration, the agent must act immediately without waiting for further user input.

## Guidelines

- Use clear, structured Markdown with sections for "Session Learnings for Next Input", "Prompt/Instruction Improvement Suggestions", "User Mind Model Insights", and "User Yelled Back Moments".
- If no new learnings or improvements are identified, state this explicitly and do not create a summary file.
- Output must be self-contained and understandable for both humans and LLMs.
- Use English for all output.
- In all sections, segregate and attribute each summary, suggestion, or learning to the reporting agent.

## Output

- Before saving, always check for duplicate files in docs/.copilot-journal. Never overwrite an existing file.
- Save the summary as a markdown file in the folder: docs/.copilot-journal. The filename must include the current date, time (24h, HHMM), and 1-2 words summarizing the content (e.g., `2025-06-11-1530-end-session-summary.md`).
- Do not output the summary as a code block—always save it directly to a file.
- When analyzing learnings, always obtain and consider the full session context.
- Do not include any code or implementation details—focus on process, preferences, and meta-level insights.
- Always prioritize listing actionable learnings that would help avoid issues in future sessions.
- In all output, clearly indicate which agent reported each item.
