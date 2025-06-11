---
description: 'Generate a clear, actionable GitHub issue for a new UI component, using the /github-issue-feature prompt for structure and requirements.'
mode: 'agent'
tools: ['codebase']
---

# UI Component Specification Issue Prompt

Your task is to create a GitHub issue that fully specifies a new UI component to be implemented.

## Instructions

- Use the [/github-issue-feature prompt](../prompts/github-issue-feature.prompt.md) as a template for the issue structure and required fields.
- Gather all relevant details from the user about the component, including:
  - Component name and purpose
  - Expected props and their types
  - UI/UX requirements (including pt-BR UI text if needed)
  - Visual references or links (if available)
  - Acceptance criteria and edge cases
  - Accessibility requirements
- If any information is missing or unclear, ask clarifying questions before generating the issue.
- Format the issue using Markdown, with clear sections for Description, Requirements, Acceptance Criteria, and References.
- Ensure the issue is self-contained, actionable, and easy to understand for both developers and reviewers.
- Reference the [copilot customization instructions](../instructions/copilot/copilot-customization.instructions.md) for best practices in clarity and completeness.

## Output

- Output the GitHub issue as a Markdown code block, ready to be posted.
- Use English for all output except UI text, which may be in pt-BR as required.
