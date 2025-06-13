# Implementation Plan for Issue 774

## Title
Filter datepicker in 'copy previous day' button to show only days with available diet

## Problem
When using the 'copy previous day' button, the datepicker currently displays all days, including those without any registered diet. This makes it difficult for users to quickly find a day to copy.

## Goal
Replace the datepicker in the copy previous day button with a list that summarizes only days with a registered diet, each with a copy action.

## Acceptance Criteria
- The user sees a list of days with a registered diet, each showing a summary (e.g., macros, meals).
- The user can easily copy from any available day with a single action.
- If there are no days to copy, a clear message is shown.
- No regression in other features.

## Analysis
- The `CopyLastDayButton` component (src/sections/day-diet/components/CopyLastDayButton.tsx) is responsible for the copy previous day feature.
- The available days with a registered diet can be obtained from the `dayDiets()` accessor, filtered by `getPreviousDayDiets`.
- Instead of rendering a datepicker, render a list of available days, each with a summary and a copy button.
- If the list is empty, show a message indicating there are no days to copy.

## Steps
1. Refactor `CopyLastDayButton` to replace the datepicker with a list of available days (using `getPreviousDayDiets`).
2. For each day, display a summary (macros, meals, etc.) and a copy button.
3. When the user clicks copy, perform the same logic as before to copy the selected day.
4. If there are no days, show a message (e.g., "No days with a registered diet available to copy.").
5. Add/adjust tests to cover this behavior.
6. Run all checks and ensure no regressions.

## Open Questions
- What summary info should be shown for each day? (Default: macros and meals)
- Should the list be paginated or limited if there are many days?

---

Approved by user to proceed with this plan.
