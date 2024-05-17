#!/bin/sh

# Get current version
version=$(sh .scripts/semver.sh | grep -Eo "v[^-]*")

# Replace version in package.json
sed -i "s/\"version\": \".*\"/\"version\": \"$version\"/" package.json
git commit --no-verify -m "[RC $version] Finish RC: set version to $version"