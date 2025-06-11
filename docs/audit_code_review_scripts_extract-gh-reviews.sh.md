# Audit: scripts/extract-gh-reviews.sh

## Summary of Changes
- New script added to extract all comments and reviews from a PR as markdown.
- Handles both top-level and inline comments, with warnings about resolved status.
- Uses zsh and jq for compatibility and parsing.

## Strengths
- Automates extraction of PR review data for audit and analysis.
- Ensures compatibility with zsh and Linux environments.
- Provides clear warnings about API limitations.

## Issues/Concerns
- Inline comment resolution status is not available via REST API; may cause confusion.
- Requires jq and gh CLI to be installed and available.

## Recommendations
- Document API limitations and required dependencies in the script header.
- Consider fallback to GraphQL API if inline comment resolution is critical.
