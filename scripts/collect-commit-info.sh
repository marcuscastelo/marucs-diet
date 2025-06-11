#!/bin/zsh

# 1. Show staged diff with stats and summary
git diff --cached --patch-with-stat --summary HEAD | tee /tmp/copilot-terminal-1 2>&1

# 2. Show staged status (porcelain)
git status --porcelain=v1 | tee /tmp/copilot-terminal-2 2>&1

# 3. List all staged new or modified files
staged_files=($(git diff --cached --name-only --diff-filter=AM))

# 4. Show full contents of each staged file
for file in $staged_files; do
  echo "===== $file ====="
  cat "$file"
done | tee /tmp/copilot-terminal-3 2>&1

echo "Collected commit information in /tmp/copilot-terminal-1, /tmp/copilot-terminal-2, and /tmp/copilot-terminal-3"
echo "Contents of collected files:"
echo "====================="
echo "Staged Diff with Stats and Summary:"
cat /tmp/copilot-terminal-1
echo
echo "====================="
echo "Staged Status (Porcelain):"
cat /tmp/copilot-terminal-2
echo
echo "====================="
echo "Full Contents of Staged Files:"
cat /tmp/copilot-terminal-3
echo
echo "====================="