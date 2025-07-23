#!/bin/bash
set -e

OWNER_REPO="marcuscastelo/macroflows"
REPO_URL="https://github.com/$OWNER_REPO"

get_current_branch() {
  if [ -n "$VERCEL_GIT_COMMIT_REF" ]; then
    echo "$VERCEL_GIT_COMMIT_REF"
  else
    local branch
    branch=$(git rev-parse --abbrev-ref HEAD)
    if [ $? -ne 0 ] || [ -z "$branch" ]; then
      echo "Error: failed to get current branch from git" >&2
      exit 1
    fi
    echo "$branch"
  fi
}

get_sha_for_branch() {
  local branch="$1"
  local sha
  sha=$(git ls-remote "$REPO_URL" "refs/heads/$branch" | awk '{print $1}')
  if [ -z "$sha" ]; then
    echo "Error: branch '$branch' does not exist in remote $REPO_URL" >&2
    exit 1
  fi
  echo "$sha"
}

get_commit_count_between() {
  local from_sha="$1"
  local to_sha="$2"
  local response http_status
  response=$(curl -s -w "\n%{http_code}" "https://api.github.com/repos/$OWNER_REPO/compare/$from_sha...$to_sha")
  http_status=$(echo "$response" | tail -n1)
  response=$(echo "$response" | sed '$d')
  if [ "$http_status" != "200" ]; then
    echo "?"
    return
  fi
  local count
  count=$(echo "$response" | grep 'total_commits' | head -1 | awk '{print $2}' | tr -d ',')
  if [ -z "$count" ]; then
    echo "Error: could not parse commit count from GitHub API response" >&2
    echo "$response" >&2
    exit 1
  fi
  echo "$count"
}

get_issue_number() {
  local branch="$1"
  echo "$branch" | sed -E 's|.*/[^0-9]*([0-9]+).*|\1|'
}

get_rc_version() {
  local current_branch="$1"
  local version stable_sha branch_sha rc_count
  version="${BASH_REMATCH[1]}"
  stable_sha=$(get_sha_for_branch stable)
  branch_sha=$(get_sha_for_branch "$current_branch")
  if [[ -n "$stable_sha" && -n "$branch_sha" ]]; then
    rc_count=$(get_commit_count_between "$stable_sha" "$branch_sha")
    if [[ -z "$rc_count" ]]; then
      rc_count='unavailable'
    fi
  else
    rc_count='error'
  fi
  echo "$version-rc.$rc_count"
}

get_dev_version() {
  local current_branch="$1"
  local closest_rc version merge_base count issue_number version_str
  closest_rc=$(git for-each-ref --format='%(refname:short)' refs/heads/ |
    grep '^rc/' |
    while read branch; do
      echo "$(git merge-base $current_branch $branch) $branch"
    done |
    sort -r |
    head -n1 |
    awk '{print $2}')

  if [ -z "$closest_rc" ]; then
    count=$(git rev-list --count HEAD)
    echo "0.0.0-dev.$count"
    return
  fi

  version=$(echo "$closest_rc" | sed -E 's|rc/(v[0-9]+\.[0-9]+\.[0-9]+)|\1|')
  merge_base=$(git merge-base HEAD "$closest_rc")
  count=$(git rev-list --count "$merge_base"..HEAD)
  issue_number=$(get_issue_number "$current_branch")

  if [ "$count" -eq 0 ]; then
    version_str="$version-dev.0"
  else
    version_str="$version-dev.$rc_count.$count"
  fi

  if [[ -n "$issue_number" ]]; then
    version_str="$version_str+issue.$issue_number"
  fi

  echo "$version_str"
}

main() {
  current_branch=$(get_current_branch)

  if [[ "$current_branch" =~ ^rc\/(v[0-9]+\.[0-9]+\.[0-9]+)$ ]]; then
    get_rc_version "$current_branch"
    exit 0
  fi

  if [[ "$current_branch" == "stable" ]]; then
    # Output the latest version tag for stable branch from remote using ls-remote
    latest_tag=$(git ls-remote --tags --refs "$REPO_URL" | awk -F/ '{print $3}' | sort -V | tail -n1)
    if [ -z "$latest_tag" ]; then
      latest_tag="v0.0.0"
    fi
    echo "$latest_tag"
    exit 0
  fi

  get_dev_version "$current_branch"
}

show_help() {
  echo "Usage: $0 [--help] [--test] [--verbose]"
  echo "  --help      Show this help message and exit."
  echo "  --test      Run simple function tests and exit."
  echo "  --verbose   Enable verbose output (set -x)."
}

# Parse arguments
if [ "$1" = "--help" ]; then
  show_help
  exit 0
fi

if [ "$1" = "--test" ]; then
  echo "Testing get_current_branch"
  if [ -n "$(get_current_branch)" ]; then
    echo "PASS: get_current_branch"
  else
    echo "FAIL: get_current_branch"
    exit 1
  fi
  echo "Testing get_sha_for_branch stable"
  if [ -n "$(get_sha_for_branch stable)" ]; then
    echo "PASS: get_sha_for_branch stable"
  else
    echo "FAIL: get_sha_for_branch stable"
    exit 1
  fi
  echo "Testing get_issue_number for 'feature/123-description'"
  if [ "$(get_issue_number 'feature/123-description')" = '123' ]; then
    echo "PASS: get_issue_number"
  else
    echo "FAIL: get_issue_number"
    exit 1
  fi
  echo "Testing stable branch version output"
  current_branch=$(get_current_branch)
  if [ "$current_branch" = "stable" ]; then
    version_output=$(main)
    if [[ $version_output =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
      echo "PASS: stable branch outputs version tag"
    else
      echo "FAIL: stable branch outputs $version_output"
      exit 1
    fi
  fi
  echo 'All tests passed.'
  exit 0
fi

if [ "$1" = "--verbose" ]; then
  set -x
fi

main "$@"
