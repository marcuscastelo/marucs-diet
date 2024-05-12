#!/bin/sh

# Get current version
version=$(sh .scripts/semver.sh)

# Replace version in package.json
sed -i "s/\"version\": \".*\"/\"version\": \"$version\"/" package.json
