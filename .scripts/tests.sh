#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

fail=0

echo "===== Running tests for all scripts ====="

for script in "$SCRIPT_DIR"/*.sh; do
  # Skip itself and utils.sh
  if [[ "$script" != "$0" && "$script" != "$SCRIPT_DIR/utils.sh" ]]; then
    chmod +x "$script"
    echo "--- Testing $script ---"
    if "$script" --test; then
      echo -e "\033[32mPASS: $script\033[0m"
    else
      echo -e "\033[31mFAIL: $script\033[0m"
      fail=1
    fi
  fi
  echo
done

if [ $fail -eq 0 ]; then
  echo "All tests passed."
else
  echo "Some tests failed."
fi

exit $fail
