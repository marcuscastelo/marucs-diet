#!/bin/zsh
# scripts/copilot-commit-info.sh
# Gathers all relevant git information for commit message generation and outputs to /tmp/copilot-commit-information

set -euo pipefail

OUTFILE="/tmp/copilot-commit-information"

{
  echo "==== GIT STATUS (porcelain) ===="
  git status --porcelain=v1
  echo

  echo "==== GIT DIFF (cached, patch-with-stat, summary) ===="
  git diff --cached --patch-with-stat --summary HEAD
  echo

  echo "==== GIT BRANCH ===="
  git branch --show-current
  echo

  echo "==== GIT LOG (last commit) ===="
  git log -1 --pretty=fuller
  echo

  echo "==== GIT CONFIG (user) ===="
  git config user.name
  git config user.email
  echo

  echo "==== GIT REMOTE ===="
  git remote -v
  echo

  echo "==== GIT STAGED FILES CONTENTS ===="
  git diff --cached --name-only | while read file; do
    if [[ -f "$file" ]]; then
      echo "---- $file ----"
      cat "$file"
      echo
    fi
  done
} > "$OUTFILE"

echo "copilot-commit-info.sh: All information written to $OUTFILE"
