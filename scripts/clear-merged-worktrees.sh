#!/usr/bin/env zsh
# scripts/clear-merged-worktrees.sh
# Remove worktrees whose branches have been merged (default) or all (merged + never committed)

set -xeuo pipefail

MODE="merged"
if [[ $# -ge 1 ]]; then
  if [[ "$1" == "--all" ]]; then
    MODE="all"
  elif [[ "$1" == "--merged" ]]; then
    MODE="merged"
  else
    echo "Usage: $0 [--merged|--all]" >&2
    exit 1
  fi
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"
git fetch --all --prune
RC_BRANCH=$(git branch -r | grep -Eo 'origin/rc/v[0-9]+\.[0-9]+\.[0-9]+' | sort -V | tail -n1)
if [[ -n "$RC_BRANCH" ]]; then
  BASE_BRANCH="${RC_BRANCH#origin/}"
else
  DEFAULT_BRANCH=$(git remote show origin | awk '/HEAD branch/ {print $NF}')
  BASE_BRANCH="$DEFAULT_BRANCH"
fi
echo "Base branch for merge check: $BASE_BRANCH"

for WT_PATH in ../marucs-diet-issue*; do
  if [[ -e "$WT_PATH/.git" ]]; then
    BRANCH=$(git -C "$WT_PATH" rev-parse --abbrev-ref HEAD)
    # Only consider branches matching the pattern
    if [[ "$BRANCH" =~ ^marcuscastelo/issue[0-9]+$ ]]; then
      cd "$WT_PATH"
      # Never remove if there are uncommitted changes
      if ! git diff --quiet || ! git diff --cached --quiet; then
        echo "[SKIP] $WT_PATH (branch: $BRANCH) has uncommitted changes."
        cd "$REPO_ROOT"
        continue
      fi
      # Never remove if there are unpushed commits
      if [[ -n $(git cherry -v) ]]; then
        echo "[SKIP] $WT_PATH (branch: $BRANCH) has unpushed commits."
        cd "$REPO_ROOT"
        continue
      fi
      # Remove merged branches (default)
      if [[ "$MODE" == "merged" ]]; then
        if git branch -r --merged origin/$BASE_BRANCH | grep -q "origin/$BRANCH$"; then
          echo "[MERGED] Removing worktree: $WT_PATH (branch: $BRANCH)"
          git worktree remove --force "$WT_PATH"
          cd "$REPO_ROOT"
          git branch -D "$BRANCH"
        else
          echo "[NOT MERGED] Worktree $WT_PATH (branch: $BRANCH) will be kept."
        fi
      # Remove merged + never committed branches (all)
      elif [[ "$MODE" == "all" ]]; then
        # Remove if merged
        if git branch -r --merged origin/$BASE_BRANCH | grep -q "origin/$BRANCH$"; then
          echo "[MERGED] Removing worktree: $WT_PATH (branch: $BRANCH)"
          git worktree remove --force "$WT_PATH"
          cd "$REPO_ROOT"
          git branch -D "$BRANCH"
        # Remove if branch has no commits ahead of base (recém-criado ou fast-forward)
        elif [[ -z $(git log origin/$BASE_BRANCH..HEAD) ]]; then
          echo "[NO COMMITS OR BEHIND] Removing worktree: $WT_PATH (branch: $BRANCH)"
          git worktree remove --force "$WT_PATH"
          cd "$REPO_ROOT"
          git branch -D "$BRANCH"
        else
          echo "[ACTIVE] Worktree $WT_PATH (branch: $BRANCH) will be kept."
        fi
      fi
      cd "$REPO_ROOT"
    else
      echo "[SKIP] Worktree $WT_PATH (branch: $BRANCH) does not match pattern."
    fi
  else
    echo "[SKIP] $WT_PATH is not a git worktree."
  fi
done
