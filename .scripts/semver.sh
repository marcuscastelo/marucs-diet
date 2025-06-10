#!/bin/bash
set -e

# Debug: print each command as it executes
set -x

git fetch --all --tags
if git ls-remote --exit-code origin stable &>/dev/null; then
  git fetch origin stable:refs/remotes/origin/stable || true
fi
# Usa VERCEL_GIT_COMMIT_REF se existir, senão usa git rev-parse
if [ -n "$VERCEL_GIT_COMMIT_REF" ]; then
  current_branch="$VERCEL_GIT_COMMIT_REF"
else
  current_branch=$(git rev-parse --abbrev-ref HEAD)
fi

if git show-ref --verify --quiet refs/heads/stable || git show-ref --verify --quiet refs/remotes/origin/stable || git show-ref --verify --quiet refs/tags/stable; then
  rc_count=$(git rev-list --count HEAD ^stable)
else
  rc_count=$(git rev-list --count HEAD)
fi
if [[ "$current_branch" =~ ^rc\/(v[0-9]+\.[0-9]+\.[0-9]+)$ ]]; then
  version="${BASH_REMATCH[1]}"
  echo "$version-rc.$rc_count"
  exit 0
fi

# Caso contrário: estamos em um branch de desenvolvimento
# Vamos encontrar a rc/* mais próxima
closest_rc=$(git for-each-ref --format='%(refname:short)' refs/heads/ |
  grep '^rc/' |
  while read branch; do
    echo "$(git merge-base $current_branch $branch) $branch"
  done |
  sort -r |
  head -n1 |
  awk '{print $2}')

if [ -z "$closest_rc" ]; then
  # Fallback: nenhum rc/* existe, usar versão base 0.0.0-dev.<commitcount>
  count=$(git rev-list --count HEAD)
  echo "0.0.0-dev.$count"
  exit 0
fi

# Extrai a versão da rc/vX.Y.Z
version=$(echo "$closest_rc" | sed -E 's|rc/(v[0-9]+\.[0-9]+\.[0-9]+)|\1|')

# Conta commits desde o ponto de divergência com a rc
merge_base=$(git merge-base HEAD "$closest_rc")
count=$(git rev-list --count "$merge_base"..HEAD)

# Extrai o número da issue (primeiro número após a barra do nome do branch)
issue_number=$(echo "$current_branch" | sed -E 's|.*/[^0-9]*([0-9]+).*|\1|')

# Constrói a versão final
if [ "$count" -eq 0 ]; then
  version_str="$version-dev.0"
else
  version_str="$version-dev.$rc_count.$count"
fi

# Anexa +issue.<numero> se extraído com sucesso
if [[ -n "$issue_number" ]]; then
  version_str="$version_str+issue.$issue_number"
fi

echo "$version_str"
