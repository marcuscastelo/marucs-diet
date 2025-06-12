#!/bin/bash

issue_number=$1
body_file=$2

if [ -z "$issue_number" ] || [ -z "$body_file" ]; then
  echo "Usage: $0 <issue_number> <body_file>"
  exit 1
fi

echo "Fetching current description for issue #$issue_number..."
gh issue view "$issue_number" --json body -q '.body' 2>&1 | tee /tmp/copilot-terminal-6 2>&1
cat /tmp/copilot-terminal-6

current_description=$(gh issue view "$issue_number" --json body -q '.body')

if [ -n "$current_description" ]; then
  echo "Adding comment with old description to issue #$issue_number..."
  gh issue comment "$issue_number" --body "$(printf 'Previous description:\n\n%s\n' "$current_description")" 2>&1 | tee /tmp/copilot-terminal-7 2>&1
  cat /tmp/copilot-terminal-7
fi

echo "Updating description for issue #$issue_number..."
gh issue edit "$issue_number" --body "$(cat "$body_file")" 2>&1 | tee /tmp/copilot-terminal-8 2>&1
echo "EDIT param1=$issue_number, param_body=$(cat "$body_file")" 
cat /tmp/copilot-terminal-8
