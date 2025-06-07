# Architecture Issue Priorities (as of 2025-06-07)

| Issue File | Title | Priority |
|---|---|---|
| 001-remove-id-generation-legacy-from-domain.md | Remove ID Generation and Legacy Utility Usage from Domain Code | Critical |
| 009-move-business-rules-to-domain.md | Refactor Orchestration Logic to Keep Business Rules in Domain | Critical |
| 014-move-business-logic-out-of-ui.md | Move Business Logic Out of UI Components | Critical |
| 028-encapsulate-business-rules-in-domain.md | Ensure All Business Rules and Invariants Are Encapsulated in Domain Entities/Value Objects | Critical |
| 002-standardize-repository-interfaces-errors.md | Standardize and Document Repository Interfaces and Error Types | Urgent |
| 005-strengthen-domain-layer-profile.md | Introduce or Strengthen Domain Layers in Weak Modules | Urgent |
| 008-application-handleApiError-context.md | Audit and Refactor Application Error Handling for handleApiError Context | Urgent |
| 018-remove-legacy-utility-usage.md | Remove Legacy Utility Usage from Domain/Application Code | Urgent |
| 003-expand-value-objects.md | Expand Use of Value Objects for Identity-less Concepts | Very Important |
| 006-improve-domain-test-coverage.md | Review and Improve Domain Test Coverage | Very Important |
| 012-application-test-coverage.md | Review Application-Level Test Coverage and Integration Points | Very Important |
| 016-ui-test-coverage.md | Review and Improve Test Coverage for UI Logic and Shared Components | Very Important |
| 022-shared-code-test-coverage-ddd.md | Review Shared Code Test Coverage and DDD Violations | Very Important |
| 004-document-bounded-contexts.md | Clarify and Document Bounded Contexts; Split Large Modules if Needed | Important |
| 007-add-custom-domain-errors.md | Add Custom Error Classes for Domain Invariants and Business Rules | Important |
| 010-audit-async-flows-error-propagation.md | Expand Audit to Async Flows, Side Effects, and Error Propagation | Important |
| 013-refactor-ui-duplicate-logic.md | Refactor Duplicated Logic in UI/Sections into Shared Hooks/Utilities | Important |
| 015-audit-ui-sections-leakage-duplication.md | Audit UI Sections for Business Logic Leakage and Duplication | Important |
| 019-document-shared-boundaries-migration.md | Clarify Migration Plan and Document Shared Module Boundaries | Important |
| 020-migrate-legacy-utilities.md | Propose and Execute Migration Steps for Remaining Legacy Utilities | Important |
| 021-map-shared-legacy-usage-blockers.md | Map All Shared/Legacy Code Usage and Document Migration Blockers | Important |
| 023-review-cross-module-dependencies.md | Review Cross-Module Dependencies and Domain Events | Important |
| 025-avoid-overengineering.md | Avoid Overengineering (CQRS, Event Sourcing, Hexagonal) Unless Justified | Important |
| 026-use-value-objects-instead-of-entities.md | Use Value Objects Instead of Entities Where Identity Is Not Essential | Important |
| 027-make-bounded-contexts-explicit.md | Make Bounded Contexts Explicit and Avoid Generic Technical Abstractions | Important |
| 029-expand-audits-test-error-integration.md | Expand Audits to Cover Test Structure, Error Propagation, and Integration Points | Important |
| 011-create-application-audit-files.md | Create Application Audit Files for Complex Modules | Relevant |
| 017-unify-edit-modals-ui.md | Unify or Consolidate Edit Modals/Views in UI Sections | Relevant |
| 024-involve-domain-experts.md | Involve Domain Experts for Ongoing Model Refinement | Relevant |
| 030-document-architecture-for-contributors.md | Document and Communicate Architectural Decisions and DDD Boundaries for New Contributors | Relevant |

> Legend: Critical, Urgent, Very Important, Important, Relevant, Neutro, Baixa Prioridade, Dispensável, Ignorar
