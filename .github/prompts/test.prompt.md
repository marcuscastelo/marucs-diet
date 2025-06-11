---
description: 'Guide the agent to create or update unit tests for the user-attached or currently open file, following project and Copilot customization best practices.'
mode: 'agent'
tools: ['codebase']
---

# Unit Test Creation/Update Agent

Your task is to create or update unit tests for the file provided by the user (either as an attachment or the currently open file).

## Instructions

- Reference the [copilot-customization.instructions.md](../instructions/copilot/copilot-customization.instructions.md) for best practices and project conventions.
- Analyze the provided file to identify all exported functions, types, and classes that require unit tests.
- For each export, ensure there is a corresponding unit test that covers its main behaviors, edge cases, and error handling.
- If tests already exist, update them to reflect any changes in the file's exports, logic, or API.
- Use concise, descriptive test names and organize tests by module.
- Use static imports at the top of the test file, never dynamic or relative imports.
- Follow the project's ESLint and formatting rules.
- Write all code and comments in English.
- Do not add explanatory comments in the code; only document what is done if absolutely necessary.
- If the file is incomplete or unclear, ask clarifying questions before generating or updating the test file.
- Output the new or updated test file as a markdown code block, using the `.test.ts` or appropriate extension.
- After generating or updating tests, suggest a commit message in English, following the conventional commits style.

## References

- [Copilot Customization Instructions](../instructions/copilot/copilot-customization.instructions.md)
