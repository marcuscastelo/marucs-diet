#!/usr/bin/env zsh
# scripts/issue-worktree.sh
# Usage: zsh scripts/issue-worktree.sh <ISSUE_NUMBER>
# Automates worktree and branch setup for issue-based workflow.

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <ISSUE_NUMBER>" >&2
  exit 1
fi

ISSUE_NUMBER="$1"
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# Find highest rc/ branch, or fallback to default remote branch
git fetch --all --prune
RC_BRANCH=$(git branch -r | grep -Eo 'origin/rc/v[0-9]+\.[0-9]+\.[0-9]+' | sort -V | tail -n1)
if [[ -n "$RC_BRANCH" ]]; then
  BASE_BRANCH="${RC_BRANCH#origin/}"
else
  DEFAULT_BRANCH=$(git remote show origin | awk '/HEAD branch/ {print $NF}')
  BASE_BRANCH="$DEFAULT_BRANCH"
fi

FEATURE_BRANCH="marcuscastelo/issue${ISSUE_NUMBER}"
WORKTREE_PATH="../marucs-diet-issue${ISSUE_NUMBER}"

# Check if worktree already exists
if [[ -d "$WORKTREE_PATH" ]]; then
  echo "Worktree $WORKTREE_PATH already exists."
  cd "$WORKTREE_PATH"
  # Check if correct branch is checked out
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  if [[ "$CURRENT_BRANCH" != "$FEATURE_BRANCH" ]]; then
    # Check if branch exists locally
    if git show-ref --verify --quiet refs/heads/$FEATURE_BRANCH; then
      git checkout "$FEATURE_BRANCH"
    else
      # Try to fetch branch from origin
      git fetch origin "$FEATURE_BRANCH":"$FEATURE_BRANCH" || git checkout -b "$FEATURE_BRANCH" "origin/$BASE_BRANCH"
      git checkout "$FEATURE_BRANCH"
    fi
  fi
else
  # Check if branch exists locally or remotely
  if git show-ref --verify --quiet refs/heads/$FEATURE_BRANCH; then
    git worktree add "$WORKTREE_PATH" "$FEATURE_BRANCH"
  elif git ls-remote --exit-code --heads origin "$FEATURE_BRANCH" >/dev/null 2>&1; then
    git fetch origin "$FEATURE_BRANCH":"$FEATURE_BRANCH"
    git worktree add "$WORKTREE_PATH" "$FEATURE_BRANCH"
  else
    git worktree add -b "$FEATURE_BRANCH" "$WORKTREE_PATH" "$BASE_BRANCH"
  fi
  cd "$WORKTREE_PATH"
fi

echo "Repository root: $REPO_ROOT"
echo "Using base branch: $BASE_BRANCH"
echo "Using feature branch: $FEATURE_BRANCH"
echo "Worktree path: $WORKTREE_PATH"

if ! command -v code >/dev/null 2>&1; then
  echo "Warning: VS Code ('code') command not found in PATH. Please open $WORKTREE_PATH manually."
else
  cp "$REPO_ROOT/.env" "$WORKTREE_PATH/.env"
  cd "$WORKTREE_PATH"
  pnpm install &
  code "$WORKTREE_PATH"
fi
