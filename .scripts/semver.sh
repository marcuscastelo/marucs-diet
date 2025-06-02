#!/bin/bash
set -e

current_branch=$(git rev-parse --abbrev-ref HEAD)

# Detecta se estamos em um branch rc/*
if [[ "$current_branch" =~ ^rc\/(v[0-9]+\.[0-9]+\.[0-9]+)$ ]]; then
  version="${BASH_REMATCH[1]}"
  count=$(git rev-list --count HEAD ^stable)
  echo "$version-rc.$count"
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
  echo "Erro: Nenhum branch rc/ encontrado como base para o branch atual."
  exit 1
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
  version_str="$version-dev.$count"
fi

# Anexa +issue.<numero> se extraído com sucesso
if [[ -n "$issue_number" ]]; then
  version_str="$version_str+issue.$issue_number"
fi

echo "$version_str"
