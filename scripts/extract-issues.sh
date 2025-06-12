mkdir -p .tmp
awk '/^## Issue #/ {
  if (issue) {
    file = ".tmp/issue-" issue "-body.md"
    print body > file
    print issue "|" file
  }
  match($0, /## Issue #([0-9]+)/, m)
  issue = m[1]
  body = $0 "\n"
  flag = 1
  next
}
/^---/ && flag {
  flag = 0
  next
}
flag {
  body = body $0 "\n"
}
END {
  if (issue) {
    file = ".tmp/issue-" issue "-body.md"
    print body > file
    print issue "|" file
  }
}
' docs/issues-without-complexity-labels.md > scripts/update-issue-desc-inputs.txt 2>&1 | tee /tmp/copilot-terminal-17 2>&1
