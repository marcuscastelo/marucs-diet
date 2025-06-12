# Architecture Audit – Summary

_Last updated: 2025-06-07_

This document provides a high-level overview of the current state of the codebase architecture, focusing on Domain-Driven Design (DDD), modularity, and separation of concerns. For detailed findings and recommendations, see the linked area-specific audits below.

## Audit Index & Status
| Area                | Audit File                | Status         | Last Update   |
|---------------------|--------------------------|----------------|--------------|
| Domain Layer        | [audit_domain.md](./audit_domain.md)         | Initial       | 2025-06-07    |
| Application Layer   | [audit_application.md](./audit_application.md) | Initial       | 2025-06-07    |
| Sections/UI Layer   | [audit_sections.md](./audit_sections.md)       | Initial       | 2025-06-07    |
| Shared & Legacy     | [audit_shared_legacy.md](./audit_shared_legacy.md) | Initial       | 2025-06-07    |

---

## Key Findings (Summary)
- **Domain Layer:** Mostly pure, but some schema/ID logic and type handling could be further isolated. See [Domain Audit](./audit_domain.md).
- **Application Layer:** Error handling is mostly correct, but some orchestration logic may leak into UI or domain. See [Application Audit](./audit_application.md).
- **Sections/UI:** Some duplication and business logic leakage into UI components. See [Sections Audit](./audit_sections.md).
- **Shared/Legacy:** Legacy utilities and shared code sometimes break DDD boundaries. See [Shared & Legacy Audit](./audit_shared_legacy.md).

---

## Next Steps
- Prioritize refactoring areas with high urgency in each audit.
- Schedule focused reviews for modules with unclear boundaries.
- Expand audits to cover test structure, error propagation, and cross-module dependencies.
- For deeper analysis, create new audit files per module/section as needed and link them here.

---

## Roadmap for Architecture Improvements

### 1. Domain Layer
- [ ] Refactor all ID generation and legacy utility usage out of domain code (see diet submodules, especially meal, item, item-group).
- [ ] Standardize and document repository interfaces and error types across all modules. Avoid nullable returns where possible.
- [ ] Expand use of value objects for identity-less concepts (e.g., measurements, macro targets).
- [ ] Clarify and document bounded contexts; split large modules if needed.
- [ ] Introduce or strengthen domain layers in modules where missing (e.g., profile).
- [ ] Review and improve domain test coverage, focusing on invariants and edge cases.
- [ ] Add custom error classes for domain invariants and business rules.

### 2. Application Layer
- [ ] Audit all error handling for missing `handleApiError` context and ensure context is always provided.
- [ ] Refactor orchestration logic to keep business rules in the domain; avoid business logic in application or UI.
- [ ] Expand audit to async flows, side effects, and error propagation.
- [ ] Create `audit_application_<module>.md` for modules with complex orchestration or async logic.
- [ ] Review application-level test coverage and integration points.

### 3. UI/Sections Layer
- [ ] Refactor duplicated logic (clipboard, schema, calculations, macro/weight/profile logic) into shared hooks/utilities.
- [ ] Move business logic (validation, calculations, state) out of UI components and into application/domain layers or custom hooks.
- [ ] Audit all section components for business logic leakage, legacy utility usage, and duplication.
- [ ] Review and improve test coverage for UI logic and shared components.
- [ ] Unify or consolidate edit modals/views (e.g., meal, recipe, item-group) if logic is highly similar.
- [ ] Standardize error handling and user feedback in UI, especially for cross-cutting features (e.g., barcode, datepicker).
- [ ] Expand audit to cover context usage, prop drilling, and state management patterns.

### 4. Shared & Legacy
- [ ] Remove legacy utility usage from domain/application code (e.g., idUtils, macroMath, deepCopy).
- [ ] Clarify migration plan and document shared module boundaries and allowed usage.
- [ ] Propose and execute migration steps for remaining legacy utilities; track progress in `audit_shared_legacy_<utility>.md` files.
- [ ] Map all shared/legacy code usage across the codebase and document migration blockers.
- [ ] Review shared code test coverage and ensure no DDD violations.

### 5. Cross-Cutting Concerns & DDD Pitfalls
- [ ] Review cross-module dependencies and domain events; avoid tight coupling and "big ball of mud" anti-patterns.
- [ ] Involve domain experts for ongoing model refinement and ensure ubiquitous language.
- [ ] Avoid overengineering (CQRS, Event Sourcing, hexagonal) unless justified by real complexity.
- [ ] Use value objects instead of entities where identity is not essential.
- [ ] Make bounded contexts explicit and avoid generic technical abstractions.
- [ ] Ensure all business rules and invariants are encapsulated in domain entities/value objects, not in services or application code.
- [ ] Expand audits to cover test structure, error propagation, and integration points.
- [ ] Document and communicate architectural decisions and DDD boundaries for new contributors.

---

## Summary

The codebase demonstrates strong modularity and a clear intent to follow DDD and clean architecture principles. Most business areas are well-structured, with separation between domain, application, and UI layers. However, there are recurring issues:
- ID generation and legacy utility usage in domain code (especially in diet submodules).
- Business logic leakage and code duplication in UI/sections.
- Inconsistent repository interfaces and lack of custom error types.
- Some modules lack a true domain layer (e.g., profile).
- Shared/legacy code still present in critical paths.

The enriched roadmap above prioritizes DDD purity, separation of concerns, consolidation of shared logic, and migration from legacy patterns. Following these steps will increase maintainability, testability, and clarity for future contributors, and help avoid common DDD pitfalls.

_See area-specific audits in the docs/ folder for detailed findings and actionable tasks._

---

# (Previous content moved to area-specific audits)
