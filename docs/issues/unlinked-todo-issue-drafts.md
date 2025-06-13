# Chore Template

title: Update documentation and tests for all changes
description: |
  - After each refactor or feature, update documentation (docs/, exported JSDoc) and tests to reflect the changes.
  - Ensure traceability, coverage, and alignment with codebase evolution.

motivation: |
  - Keeps documentation and tests in sync with code changes.
  - Ensures traceability and high-quality standards across the project.

acceptance_criteria:
  - [ ] Documentation and JSDoc are updated for all changes
  - [ ] Tests are created or reviewed for all changes
  - [ ] All checks (`npm run check`) pass

additional_notes: |
  - Update related documentation and tests in docs/ and src/
  - See `docs/CODESTYLE_GUIDE.md` and `docs/ARCHITECTURE_GUIDE.md` for standards

labels:
  - documentation
  - testing
  - chore
  - complexity-medium

reportedBy: github-copilot.v1
