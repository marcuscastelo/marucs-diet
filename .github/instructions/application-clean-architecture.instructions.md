---
applyTo: "**/application/**"
---
# Clean Architecture: Application Layer

- Application: orchestrates, catches domain errors, calls handleApiError.
- Application: always calls handleApiError with context.
- Never log/throw errors in app code without handleApiError.
