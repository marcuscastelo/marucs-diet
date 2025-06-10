#!/bin/bash
set -e
# set -x

REPO_URL="https://github.com/marcuscastelo/marucs-diet"

get_current_branch() {
  if [ -n "$VERCEL_GIT_COMMIT_REF" ]; then
    echo "$VERCEL_GIT_COMMIT_REF"
  else
    git rev-parse --abbrev-ref HEAD
  fi
}

get_sha_for_branch() {
  local branch="$1"
  git ls-remote "$REPO_URL" "refs/heads/$branch" | awk '{print $1}'
}

get_commit_count_between() {
  local from_sha="$1"
  local to_sha="$2"
  curl -s "https://api.github.com/repos/marcuscastelo/marucs-diet/compare/$from_sha...$to_sha" | grep 'total_commits' | head -1 | awk '{print $2}' | tr -d ','
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

  get_dev_version "$current_branch"
}

show_help() {
  echo "Usage: $0 [--help] [--test] [--verbose]"
  echo "  --help      Show this help message and exit."
  echo "  --test      Run simple function tests and exit."
  echo "  --verbose   Enable verbose output (set -x)."
}

# Parse arguments
for arg in "$@"; do
  case $arg in
    --help)
      show_help
      exit 0
      ;;
    --test)
      echo "Testing get_current_branch..."
      branch=$(get_current_branch)
      echo "Result: $branch"
      if [ -z "$branch" ]; then echo 'FAIL: get_current_branch'; exit 1; fi
      echo "Testing get_sha_for_branch stable..."
      sha=$(get_sha_for_branch stable)
      echo "Result: $sha"
      if [ -z "$sha" ]; then echo 'FAIL: get_sha_for_branch'; exit 1; fi
      echo "Testing get_issue_number for 'feature/123-description'..."
      issue=$(get_issue_number 'feature/123-description')
      echo "Result: $issue"
      if [ "$issue" != "123" ]; then echo 'FAIL: get_issue_number'; exit 1; fi
      echo "Testing get_rc_version for rc/v0.0.1..."
      export BASH_REMATCH=("" "v0.0.1")
      rc_version=$(get_rc_version 'rc/v0.0.1')
      echo "Result: $rc_version"
      if [[ ! "$rc_version" =~ ^v0\.0\.1-rc\. ]]; then echo 'FAIL: get_rc_version'; exit 1; fi
      echo "Testing get_dev_version for current branch..."
      dev_version=$(get_dev_version "$branch")
      echo "Result: $dev_version"
      if [[ -z "$dev_version" ]]; then echo 'FAIL: get_dev_version'; exit 1; fi
      echo 'All tests passed.'
      exit 0
      ;;
    --verbose)
      set -x
      ;;
  esac
  shift
  break
  # Only process the first argument for these flags
  # Remaining args are passed to main
  # This avoids running main multiple times if multiple flags are passed
  # If you want to support multiple flags together, remove 'break'
done

main "$@"
