#!/bin/sh

closest_branch=$(git show-branch -a \
| grep '\*' \
| grep -v `git rev-parse --abbrev-ref HEAD` \
| head -n1 \
| grep -Eo '\[.*\] [\[]' \
| grep -Eo '\[.*\]' \
| sed 's/\[\(.*\)\]/\1/' \
)

echo "$closest_branch" | grep -E "rc/" >/dev/null
isrc=$?
if [ $isrc -eq 0 ]; then
  count=$(git rev-list --count HEAD ^main)
  version=$(echo "$closest_branch" | sed -e 's/rc\/\(.*\)/\1/')
  postfix="-rc.$count"
else
  count=$(git rev-list  `git rev-list --tags --no-walk --max-count=1`..HEAD --count)
  # If count is 0, then it's a release tag, so we should return the tag itself
  if [ $count -eq 0 ]; then
    echo "$(git tag | tail -1)"
    exit 0
  fi
  version=$(git tag | tail -1)
  postfix="-dev.$count"
fi

# Otherwise, we should return the tag with the count
echo "$version$postfix"
