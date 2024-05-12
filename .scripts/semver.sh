#!/bin/sh

count=$(git rev-list  `git rev-list --tags --no-walk --max-count=1`..HEAD --count)
# If count is 0, then it's a release tag, so we should return the tag itself
if [ $count -eq 0 ]; then
  echo "$(git tag | tail -1)"
  exit 0
fi
# Otherwise, we should return the tag with the count
echo "$(git tag | tail -1)-dev.$count"
