#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$DIR/.."
VERSION=$("$DIR/semver.sh")
echo '{"version": "'$VERSION'"}' > "$ROOT/src/app-version.json"
