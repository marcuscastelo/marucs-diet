#!/bin/sh

supports_colors() {
  return 1
}

cecho() {
  printf "%s\n" "$2"
}

section() {
  echo
  echo "===== $1 ====="
}

section_end() {
  echo "===== Finished $1 ====="
  echo
}

run_test() {
  local desc="$1"
  local cmd="$2"
  section "$desc"
  local output
  output=$(eval "$cmd" 2>&1)
  local status=$?
  if [ $status -eq 0 ]; then
    cecho "" "  PASS: $desc"
  else
    cecho "" "  FAIL: $desc"
    echo "$output"
  fi
  section_end "$desc"
}
