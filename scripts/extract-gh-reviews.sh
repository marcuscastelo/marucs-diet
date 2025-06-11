#!/bin/zsh
# Usage: ./extract-gh-reviews.sh <PR_NUMBER>
# Extrai todos os comentários e reviews (incluindo inline) de uma PR como markdown
# AVISO: Comentários inline resolved e não resolved são exibidos, pois a API REST não expõe o campo 'resolved'.

if [[ -z "$1" ]]; then
  echo "Usage: $0 <PR_NUMBER>"
  exit 1
fi

pr_number="$1"

# Top-level comments e review summaries
output=$(gh pr view "$pr_number" --json reviews,comments \
  | jq -r '
    # Top-level comments
    .comments[]? | "### COMMENT by \(.author.login)\n\n" + .body + "\n---" 
    ,
    # Review bodies
    .reviews[]? | select(.body != null and .body != "") | "### REVIEW by \(.author.login)\n\n" + .body + "\n---" 
  ')

# Comentários inline de review (review_comments)
inline=$(gh api repos/:owner/:repo/pulls/$pr_number/comments \
  | jq -r 'if type=="array" and length > 0 then "# ATENÇÃO: Inline comments resolved e não resolved são exibidos.\n" + (map("### INLINE by \(.user.login)\n\n**File:** \(.path)\n**Line:** \(.line)\n\n" + .body + "\n---") | join("\n")) else "(No inline comments found)" end')

# Exibe tudo
print -- "$output"
print -- "$inline"
