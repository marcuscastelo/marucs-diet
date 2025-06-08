---
applyTo: "**"
---
# Promises, Formatting, Imports, Testing

- Use `void` only for fire-and-forget in handlers/events, never `.catch(() => {})`.
- Use Prettier/ESLint for JS/TS. Prefer type aliases, never use any.
- Always use static imports at the top.
- Update tests for all changes. Run `npm run check` and wait for "All checks passed".
