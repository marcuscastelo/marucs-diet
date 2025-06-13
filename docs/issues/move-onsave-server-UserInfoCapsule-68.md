# Refactor Template

**Title:**
Move to server onSave(newProfile) in UserInfoCapsule

**Description:**
Refactor the `onSave(newProfile)` logic in `UserInfoCapsule` so that all profile update operations are handled on the server. Update all usages, types, and documentation to reflect this change. Ensure that the application layer and tests are updated to expect server-side profile updates.

**Scope:**
- src/sections/profile/components/UserInfoCapsule.tsx
- All files and modules referencing `onSave(newProfile)`
- Related documentation and tests

**Motivation:**
Moving profile update logic to the server improves security, separation of concerns, and maintainability. It also ensures that sensitive operations are not exposed in the client code.

**Acceptance Criteria:**
- [ ] `onSave(newProfile)` logic is moved to the server
- [ ] All usages, types, and documentation are updated
- [ ] All affected tests are updated

**Additional Context:**
- Review all usages of `onSave(newProfile)` in the codebase
- See `docs/audit_sections_profile.md` for related architectural notes

**Labels:**
- refactor
- backend
- complexity-high
- security
- improvement

**reportedBy:** github-copilot.v1
