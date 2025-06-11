#!/bin/zsh
# scripts/check-audit-summary.sh
# Checks if all audit_code_review_*.md files are referenced in RESUMO_AUDITORIAS.md and vice-versa.
# Usage: zsh scripts/check-audit-summary.sh

set -e

audits=(docs/audit_code_review_*.md)
summary=docs/RESUMO_AUDITORIAS.md

missing_in_summary=()
for audit in $audits; do
  fname=$(basename $audit)
  if ! grep -q "$fname" $summary; then
    missing_in_summary+=$fname
  fi
done

if [[ ${#missing_in_summary[@]} -gt 0 ]]; then
  echo "The following audit files are not referenced in $summary:" >&2
  for f in $missing_in_summary; do
    echo "  - $f" >&2
  done
  exit 1
else
  echo "All audit files are referenced in $summary."
fi
