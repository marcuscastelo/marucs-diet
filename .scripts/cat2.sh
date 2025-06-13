#!/bin/zsh
if [[ "$1" = "--test" ]]; then
echo "This is a test run of the script."
  exit 1
fi
cat "$1"
