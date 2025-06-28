#!/usr/bin/env zsh
# scripts/create-immediate-prompt.sh
# Usage: zsh scripts/create-immediate-prompt.sh <WORKTREE_PATH> <REPO_ROOT> <ISSUE_NUMBER>
# Creates .immediate.prompt.md for a given issue in the specified worktree.

set -euo pipefail

if [[ $# -ne 3 ]]; then
  echo "Usage: $0 <WORKTREE_PATH> <REPO_ROOT> <ISSUE_NUMBER>" >&2
  exit 1
fi

WORKTREE_PATH="$1"
REPO_ROOT="$2"
ISSUE_NUMBER="$3"

PROMPT_DIR="$WORKTREE_PATH/.github/prompts"
PROMPT_FILE="$PROMPT_DIR/.immediate.prompt.md"
TEMPLATE_FILE="$REPO_ROOT/.github/prompts/issue-implementation.prompt.md"

mkdir -p "$PROMPT_DIR"
if [[ -f "$TEMPLATE_FILE" ]]; then
  sed "s/Issue Implementation Agent/Immediate Issue Agent for Issue #${ISSUE_NUMBER}/; s/implementing a GitHub issue/implementing GitHub issue #${ISSUE_NUMBER}/g; s/<ISSUE_NUMBER>/${ISSUE_NUMBER}/g" "$TEMPLATE_FILE" > "$PROMPT_FILE"
else
  echo "Warning: Template $TEMPLATE_FILE not found. Skipping immediate.prompt.md creation." >&2
fi
