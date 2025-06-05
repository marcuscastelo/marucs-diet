# Copilot Short Guide

- Use descriptive, action-based names for all code.
- Never use handleApiError in domain code; only throw pure errors.
- Application layer must catch domain errors and call handleApiError with context.
- Use void for fire-and-forget promises only in event handlers, never .catch(() => {}).
- All code/comments in English, except UI text (Portuguese allowed if required).
- UI text must be in Portuguese if required by the product.
- Never use any, always prefer type aliases.
- Always update or remove related tests when changing code.
- Follow Prettier/ESLint for formatting.
- Prefer small, atomic commits and always suggest a commit message after changes.