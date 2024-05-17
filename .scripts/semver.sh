#!/bin/sh

git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/\1/' | grep -E "rc/" >/dev/null
isrc=$?
if [ $isrc -eq 0 ]; then
  count=$(git rev-list --count HEAD ^main)
  version=$(git branch 2> /dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/\1/' -e 's/rc\/\(.*\)/\1/')
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
