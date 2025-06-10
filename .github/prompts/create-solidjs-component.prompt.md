---
description: 'Generate a new functional SolidJS component in TypeScript.'
mode: 'agent'
tools: ['codebase']
---

# SolidJS Component Generator

Generate a new functional SolidJS component in TypeScript named `${input:ComponentName:Component name}`.

## Requirements
- The component must be created in `src/components/${input:ComponentName}`.
- Use explicit typing for props.
- Include a CSS Module for styles.
- Add a usage example at the end of the file.
- All UI text must be in pt-BR.
- Use English for code, comments, and identifiers.
- Never use dynamic imports or any.
- Always use static imports at the top.
- Prefer small, atomic functions and modular structure.
- Never add explanatory comments, only documentation if strictly necessary.
- Review the current file version before editing.

Reference: [copilot-customization.instructions.md](../instructions/copilot/copilot-customization.instructions.md)
