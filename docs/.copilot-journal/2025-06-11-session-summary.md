# Session Learnings for Next Input

- **Refactor Workflow**: User prefers large refactors to be split into atomic, conventional commits, each with a clear scope (e.g., utility extraction, memoization, type export, test addition).
- **Application Layer Utilities**: Extraction of domain/application logic (e.g., `getTopContributors`, `calcMaxItemQuantity`, `applyItemEdit`) into dedicated files in the application layer is expected for maintainability and testability.
- **Type Exports**: All shared types (e.g., `MacroContributorEntry`) should be exported from a domain/types file and used across modules for consistency.
- **JSDoc**: All exported functions and types must have concise, English JSDoc. Outdated JSDoc must be removed.
- **Testing**: New utilities must have unit tests in the appropriate `tests/` folder, even if only basic shape/contract tests are possible.
- **Memoization**: Use `createMemo` for computed lists in SolidJS to avoid unnecessary recomputation and improve performance.
- **Dismiss Logic**: When using memoized lists, stateful filtering (e.g., for "next" actions) should be handled only in the editing state, not in signals.
- **Unused Code**: Remove all unused signals, variables, and imports after refactor.
- **Commit Process**: Always use the provided commit prompt and script to generate and apply conventional commit messages.
- **Shell/OS**: The workspace uses Linux and zsh; all shell commands must be compatible.
- **Prompt Adherence**: All code, comments, and commit messages must be in English, except UI text (pt-BR).
- **Session End**: At session end, always enumerate actionable learnings and blockers in checklist format for future continuity.

## Prompt/Instruction Improvement Suggestions

- **Checklist Format**: Add an explicit checklist template to the end-session prompt to ensure all learnings are captured consistently.
- **Atomic Commit Guidance**: Instruct agents to always split large refactors into atomic, conventional commits, and to document the scope of each.
- **Testing Enforcement**: Clarify that all new utilities must have at least basic unit tests, even if only for contract/shape.
- **Memoization Guidance**: Add a note to refactor prompts about using `createMemo` for computed lists in SolidJS, and to update stateful logic accordingly.
- **Dismiss/Stateful Logic**: Add a warning that when switching from signals to memos, all stateful filtering must be moved to the editing state or equivalent.
- **Shell/OS Blockers**: Remind agents to flag any shell/OS-specific issues (e.g., zsh-specific command syntax) encountered during the session.
- **Prompt Metadata**: If any prompt metadata or workflow blockers are encountered (e.g., missing scripts, lint errors), flag them for review in the next session.

---

This summary should be saved as a markdown file in `docs/.copilot-journal` for future reference.
