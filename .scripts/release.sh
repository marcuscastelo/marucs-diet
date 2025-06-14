#!/bin/bash

# Test mode
if [ "$1" = "--test" ]; then
  echo "Testing semver.sh returns version"
  if bash .scripts/semver.sh | grep -Eo '[0-9]+\.[0-9]+\.[0-9]+' 2>/dev/null; then
    echo "PASS: semver.sh returns version"
    exit 0
  else
    echo "FAIL: semver.sh did not return version"
    exit 1
  fi
fi

# Get current version
version=$(bash .scripts/semver.sh | grep -Eo "[0-9]+\.[0-9]+\.[0-9]+")

# Replace version in package.json
sed -i "s/\"version\": \".*\"/\"version\": \"$version\"/" package.json
git add package.json
git commit --no-verify -m "[RC $version] Finish RC: set version to $version"