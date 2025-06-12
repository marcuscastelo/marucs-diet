#!/bin/bash

awk '
/^## Issue #/ {
  if (issue) {
    printf "executando com \047param1=%s\047\n", issue
    print "---"
    print body
    print "---"
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
    printf "executando com \047param1=%s\047\n", issue
    print "---"
    print body
    print "---"
  }
}
' docs/issues-without-complexity-labels.md
