# Domain Layer Audit

## Overview
The domain layer is responsible for pure business logic, validation, and type safety. It should not contain side effects, error handling utilities, or infrastructure concerns.

## Findings
- **Schema/Type Logic:** Some domain files (e.g., `item.ts`, `dayDiet.ts`) include ID generation or type transformation logic that could be moved to infrastructure or application layers.
- **Error Handling:** Domain code correctly avoids `handleApiError`, but custom error classes could be standardized for better context.
- **Purity:** Most domain modules are pure, but some rely on legacy utilities (e.g., `generateId` in domain).

## Urgency
- **High:** Remove ID generation and side-effect utilities from domain code.
- **Medium:** Standardize error types and schemas.

## Next Steps
- Audit all domain modules for side-effect imports.
- Refactor ID and type logic to infrastructure.
- Document domain error types and usage patterns.

## Future Refinement Suggestions
- Perform a per-module audit (e.g., diet, measure, profile) and create `audit_domain_<module>.md` files as needed.
- Analyze domain model boundaries and invariants.
- Review test coverage for domain logic.

# Domain Layer Audit – High-Level Review

_Last updated: 2025-06-07_

## General Assessment
The codebase demonstrates a strong commitment to modularity and DDD-inspired organization, with clear separation between domain, application, and infrastructure layers in most modules. Each business area (diet, measure, user, etc.) is structured as a module, and most domain logic is isolated from side effects and technical concerns.

### What Works Well
- **Modular Structure:** Each business area is a separate module, making the codebase easier to navigate and reason about.
- **Consistent Use of Schemas:** Zod schemas are used throughout for validation and type safety.
- **Repository Abstractions:** Most modules define repository interfaces, supporting testability and separation of concerns.
- **Avoidance of Side Effects in Domain:** Domain code generally avoids direct side effects and technical dependencies.
- **Application Layer Orchestration:** Application code is responsible for error handling and orchestration, following clean architecture principles.

### Areas for Improvement
- **Domain Layer Granularity:** Some modules (e.g., profile) lack a true domain layer, mixing business rules with application logic. Introduce domain layers where missing.
- **ID Generation in Domain:** Several submodules (notably in diet) still generate IDs in domain code, breaking DDD purity. Move all ID generation to infrastructure or application.
- **Repository Interface Consistency:** Some modules lack repository interfaces or have inconsistent contracts (e.g., nullable returns). Standardize and document these interfaces.
- **Custom Error Types:** Most domain layers lack custom error classes for business invariants, making error handling less expressive.
- **Test Coverage:** Domain logic tests exist but should be expanded to cover invariants and edge cases.
- **Value Objects vs Entities:** Some models treat all objects as entities with IDs, even when identity is not essential. Use value objects where appropriate.
- **Bounded Contexts:** The current structure is modular, but bounded contexts are not always explicit. Consider clarifying boundaries and language per context.

### Opportunities to Consolidate or Separate
- **Consolidate Simple Modules:** If a module is only a thin wrapper around CRUD (e.g., profile), consider merging it with a related context or expanding its domain logic.
- **Separate Large Modules:** If a module (e.g., diet) grows too large or mixes unrelated subdomains, consider splitting into clearer bounded contexts (e.g., nutrition, planning).
- **Clarify Value Objects:** Refactor models to use value objects for types that do not require identity (e.g., measurements, macro targets).

## DDD Best Practices & Common Pitfalls (Observed)
- Avoid overengineering with DDD in simple CRUD modules (see: profile).
- Focus on rich domain models, not just technical layering.
- Place business rules and invariants inside entities/value objects, not only in services.
- Make bounded contexts explicit to avoid a "big ball of mud" domain.
- Involve domain experts to refine models and language.
- Only introduce advanced patterns (CQRS, Event Sourcing) if justified by complexity.
- Use value objects for simple, identity-less concepts.
- Keep domain services focused on business rules; application services should only orchestrate.

## Next Steps
- [ ] Refactor modules with missing or weak domain layers (e.g., profile).
- [ ] Move all ID generation and technical concerns out of domain code.
- [ ] Standardize repository interfaces and error types across modules.
- [ ] Expand use of value objects and clarify bounded contexts.
- [ ] Review and improve domain test coverage.
- [ ] Involve domain experts for ongoing model refinement.

---

_This review is based on current codebase structure and DDD best practices. See submodule audits for detailed findings and actionable tasks._
