# Copilot Short Guide

See `.github/copilot-instructions.md` for the full instructions.

- Use descriptive, action-based names.
- Never use handleApiError in domain code.
- Application layer must call handleApiError with context.
- Use `void` for fire-and-forget promises only in event handlers.
- All code/comments in English (UI text in pt-BR if required).
- Never use `any`, always prefer type aliases.
- Always update or remove related tests when changing code.
- Follow ESLint for formatting.
- Prefer small, atomic commits and always suggest a commit message after changes.
- Never use dynamic imports. Always use static imports at the top.
- **After any terminal command, always check the output file repeatedly until a clear success or error message is found; never rerun the main command.**

## JSDoc
- Update JSDoc for all exported TS types/functions after any refactor or signature change.

## Macro Contributor Ranking – 3D Space Insight

- When ranking food items by macro contribution, consider each item as a vector in a 3D space (carbs, protein, fat).
- **Ranking criteria can diverge:**
  - *Density (macro per gram):* Favors pure sources (e.g., whey for protein).
  - *Total macro (macro × quantity):* Favors large portions, even if less dense.
  - *Proportion (macro / sum of macros):* Favors items where one macro dominates (e.g., oil ≈ 100% fat).
  - *Relative contribution to daily total:* Favors items that, by quantity, most impact the day's macro total.
- **Examples:**
  - 10g whey (8g protein, high density) vs. 200g rice (6g protein, low density, but more total if portion increases).
  - 10g oil (10g fat, pure) vs. 100g bread (2g fat, but if 600g bread, total fat > oil).
- **Non-orthogonal bases:**
  - Most foods are not pure in one macro; they form approximate, non-orthogonal bases in the 3D macro space (e.g., bread, milk, peanuts).
  - Combining such foods allows reaching nearly any macro combination.
- When selecting foods to reduce a specific macro, prioritize those most aligned with the target axis (macro dominance), then by density or total impact as needed.