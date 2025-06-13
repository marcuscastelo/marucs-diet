# Refactor Template

**Title:**
Move business logic from UI to application/hooks layer

**Description:**
Extract business logic (e.g., clipboard handling, schema validation, calculations) from UI components in macro-nutrients, item-group, and food-item sections. Move this logic into dedicated hooks or the application layer to improve separation of concerns and maintainability. Update all affected modules, types, and documentation.

**Scope:**
- src/sections/macro-nutrients/components/MacroTargets.tsx
- src/sections/item-group/components/ItemGroupEditModal.tsx
- src/sections/food-item/components/ItemEditModal.tsx
- src/modules/diet/*
- All related hooks and application modules

**Motivation:**
Separating business logic from UI components improves maintainability, testability, and code clarity. It also aligns with clean architecture principles and reduces coupling between UI and domain logic.

**Acceptance Criteria:**
- [ ] All business logic is extracted from UI components to hooks or the application layer
- [ ] UI components only consume hooks and display data
- [ ] All affected tests and documentation are updated

**Additional Context:**
- Review all business logic in the specified components
- See `docs/ARCHITECTURE_GUIDE.md` for clean architecture guidelines

**Labels:**
- refactor
- complexity-medium
- ui
- backend
- improvement

**reportedBy:** github-copilot.v1
