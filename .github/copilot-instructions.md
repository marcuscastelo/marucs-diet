## Language
All code, files, commits, messages, and comments must be written in 
English. Even if the user communicates in another language, the output 
should always be in English. Answers should be short and avoid 
unnecessary explanations.
Only exceptions are:
- UI text, such as button labels, form fields, and error messages, should be in Portuguese (pt-BR).

## Code Quality
The code must be:
- Clean
- Efficient
- Following best practices
Use descriptive and meaningful names for all variables, functions, 
classes, and files. Organize the code into logical modules and packages, 
following the project's directory structure.

### Typescript

- Never use `any` type, NEVER.

## Formatting
Formatting should be consistent throughout the codebase. Use appropriate 
tools such as:
- Prettier or ESLint for JavaScript
- Black for Python
This ensures proper indentation, spacing, and line breaks.

## Style
Maintain a consistent style, including:
- Formatting
- Indentation
- Naming conventions
Add comments to explain complex logic or important decisions, but avoid 
comments that state the obvious.

## Documentation
All functions and classes should include docstrings that explain their 
purpose and usage.

## Testing
For every new feature or bug fix:
- Write unit tests that cover edge cases
- Always update the test files in the same commit as the code changes (adding, modifying, or removing functions should be accompanied by corresponding test updates)
- After making any change, run the `npm type-check` and `npx vitest run`, remember to wait for the output before reading the terminal
- If any problems are detected, fix them immediately
- For every code change (including refactoring, renaming, or moving code), always search for and update all related test files in the same commit. 
- If a function, class, or file is changed, renamed, or removed, ensure all corresponding tests are also updated, renamed, or removed accordingly. 
- Never leave orphaned or outdated tests after a code change.

## Commits
- Prioritize small commits (atomic)
- After some refactoring, sugest the user to commit the changes
- After additions, refactors, removals, suggest a commit message

## Code Reviews
All generated code should be ready for code review, meeting the project's 
coding standards and passing all tests before submitting a pull request.

This file should not be modified directly without user consent.