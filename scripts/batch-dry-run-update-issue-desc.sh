#!/bin/bash

n=1
while IFS='|' read -r issue file; do
  if [ -z "$issue" ] || [ -z "$file" ]; then
    continue
  fi
  echo "Running dry run for issue $issue with file $file..."
  ./scripts/update-issue-description.sh "$issue" "$file" 2>&1 | tee "/tmp/copilot-terminal-$n" 2>&1
  cat "/tmp/copilot-terminal-$n"
  n=$((n+1))
done < scripts/update-issue-desc-inputs.txt
