# Legacy Entity Migration and Removal Plan (Item/ItemGroup) - v0.14.0

_Created: June 18, 2025_  
_Status: Proposal for review_  
_Author: AI Assistant based on Phases 1, 2, and 3 implementation_

## Executive Summary

This document details the migration and removal plan for legacy `Item` and `ItemGroup` entities in version v0.14.0, following the successful completion of **Phases 1-3** of the `UnifiedItem` hierarchical model implementation. The plan ensures a smooth transition with no breaking changes during the migration period.

## Context and Current State

### Implemented Phases (v0.12.0 → v0.13.0)

#### **✅ Phase 1 (Completed)**: Infrastructure
- Created `UnifiedItem` structure with hierarchical support
- Implemented Zod schemas for validation
- Conversion utilities between legacy and unified
- Migration utilities for runtime data transformation

#### **✅ Phase 2 (Completed)**: Domain  
- Domain operations for `UnifiedItem`
- Integration with macronutrient systems
- Hierarchical invariant validation
- Comprehensive domain tests

#### **✅ Phase 3 (Completed)**: Application
- Application service refactoring
- Bidirectional legacy ↔ unified compatibility
- Business logic for unified operations
- Clipboard and editing utilities

### Data State

- **Database**: Still in legacy format (meals → groups → items)
- **Runtime**: Automatic transparent migration to UnifiedItem
- **APIs**: Bidirectional compatibility maintained
- **Frontend**: Using legacy interfaces with runtime conversions

## v0.14.0 Objectives

1. **Complete Database Migration**: Convert all persisted data structures
2. **Codebase Simplification**: Eliminate compatibility code
3. **Performance**: Remove runtime conversions
4. **Zero Downtime**: Transparent migration for users

## Implementation Timeline

### **MILESTONE 1: Preparation (Weeks 1-2)**

#### 1.1 Analysis and Audit
- [ ] **Complete usage audit**: Map all references to `Item` and `ItemGroup`
- [ ] **Dependency analysis**: Identify modules still directly depending on legacy entities
- [ ] **Test coverage**: Ensure 100% coverage for critical functionalities
- [ ] **Performance baseline**: Establish current performance metrics

#### 1.2 Migration Preparation
- [ ] **Database migration script**: Develop and test complete SQL migration
- [ ] **Backup and rollback**: Backup strategies and rollback procedures
- [ ] **Test environments**: Configure environments with anonymized production data

### **MILESTONE 2: Database Migration (Weeks 3-4)**

#### 2.1 Schema Migration
```sql
-- Example migration (conceptual structure)
ALTER TABLE meals 
  ADD COLUMN items JSONB,
  ADD COLUMN migrated_at TIMESTAMP;

-- Populate new column with migrated data
UPDATE meals SET 
  items = convert_groups_to_unified_items(groups),
  migrated_at = NOW()
WHERE items IS NULL;

-- Create indexes for performance
CREATE INDEX idx_meals_items_gin ON meals USING GIN (items);
```

#### 2.2 Data Validation
- [ ] **Integrity verification**: Compare legacy vs migrated data
- [ ] **Performance tests**: Validate that UnifiedItem queries are at least as fast
- [ ] **Rollback testing**: Test rollback procedures in non-production environments

#### 2.3 Gradual Deployment
- [ ] **Canary deployment**: Migrate 5% of users initially
- [ ] **Active monitoring**: Error, performance, and behavior metrics
- [ ] **Progressive rollout**: 20% → 50% → 100% based on metrics

### **MILESTONE 3: Internal Refactoring (Weeks 5-6)**

#### 3.1 Documentation Update
- [ ] **README updates**: Document migration guide
- [ ] **Migration guide**: Technical guide for implementation details

### **MILESTONE 4: Internal Refactoring (Weeks 7-8)**

#### 4.1 Runtime Conversion Elimination
```typescript
// BEFORE (v0.13.0)
export async function getMeal(id: number): Promise<Meal> {
  const rawData = await database.getMeal(id)
  return migrateLegacyMealToUnified(rawData) // Runtime conversion
}

// AFTER (v0.14.0)
export async function getMeal(id: number): Promise<Meal> {
  return await database.getMeal(id) // Data already in correct format
}
```

#### 4.2 Schema Simplification
```typescript
// Remove legacy schemas and conversion utilities
// Keep only unifiedItemSchema and related operations
```

#### 4.3 Import Cleanup
- [ ] **Legacy import removal**: Eliminate `Item` and `ItemGroup` imports where unnecessary
- [ ] **Type updates**: Replace legacy types with `UnifiedItem` throughout application
- [ ] **Utilities cleanup**: Remove conversion functions that are no longer needed

## Compatibility Strategy

### During Transition (v0.14.0)

#### Wrapper Functions
```typescript
// Temporary compatibility wrapper functions
export function createItemFromFood(food: Food): UnifiedItem {
  return createUnifiedItem({
    name: food.name,
    reference: { type: 'food', id: food.id },
    quantity: 100, // default
    macros: food.macros
  })
}
```

### Frontend Compatibility Layer

#### Component Wrappers
```typescript
// Legacy components that internally use UnifiedItem
export const LegacyItemEditor = (props: { item: Item }) => {
  const unifiedItem = useMemo(() => convertItemToUnified(props.item), [props.item])
  return <UnifiedItemEditor item={unifiedItem} />
}
```

## Metrics and Monitoring

### Migration Metrics
- **Conversion rate**: % of data successfully migrated
- **Data integrity**: Checksum comparison legacy vs unified  
- **Performance**: Response time before/after migration
- **Error rate**: Errors during migration and post-migration usage

### Critical Alerts
- **Migration failure**: > 1% failures in data conversion
- **Performance degradation**: > 20% increase in response time
- **High error rate**: > 0.1% errors in critical operations

### Monitoring Dashboard
```typescript
interface MigrationMetrics {
  totalRecords: number
  migratedRecords: number
  failedMigrations: number
  averageResponseTime: number
  errorRate: number
  rollbacksExecuted: number
}
```

### Monitoring and Validation Tools

#### Pre-Migration Audit Script
```typescript
// scripts/audit-legacy-usage.ts
import { Project } from 'ts-morph'

interface LegacyUsageReport {
  files: string[]
  importStatements: string[]
  typeUsages: string[]
  riskLevel: 'high' | 'medium' | 'low'
}

export async function auditLegacyUsage(): Promise<LegacyUsageReport> {
  const project = new Project({ tsConfigFilePath: 'tsconfig.json' })
  const sourceFiles = project.getSourceFiles()
  
  const legacyPatterns = [
    /import.*Item.*from.*\/item\/domain\/item/,
    /import.*ItemGroup.*from.*\/item-group\/domain\/itemGroup/,
    /:\s*Item\s*[,\|\]]/,
    /:\s*ItemGroup\s*[,\|\]]/,
    /ItemGroup\[\]/,
    /Item\[\]/
  ]
  
  const usageReport: LegacyUsageReport = {
    files: [],
    importStatements: [],
    typeUsages: [],
    riskLevel: 'low'
  }
  
  for (const sourceFile of sourceFiles) {
    const text = sourceFile.getFullText()
    
    for (const pattern of legacyPatterns) {
      if (pattern.test(text)) {
        usageReport.files.push(sourceFile.getFilePath())
        
        // Extract specific lines
        const matches = text.match(pattern)
        if (matches) {
          usageReport.typeUsages.push(...matches)
        }
      }
    }
  }
  
  // Determine risk level based on usage count
  if (usageReport.files.length > 50) {
    usageReport.riskLevel = 'high'
  } else if (usageReport.files.length > 20) {
    usageReport.riskLevel = 'medium'
  }
  
  return usageReport
}

// Command: npm run audit:legacy-usage
```

#### Data Integrity Validator
```typescript
// scripts/validate-migration-integrity.ts
interface MigrationValidationResult {
  totalMeals: number
  successfulMigrations: number
  failedMigrations: number
  dataIntegrityIssues: string[]
  macroDiscrepancies: number
  missingItems: number
}

export async function validateMigrationIntegrity(): Promise<MigrationValidationResult> {
  const result: MigrationValidationResult = {
    totalMeals: 0,
    successfulMigrations: 0,
    failedMigrations: 0,
    dataIntegrityIssues: [],
    macroDiscrepancies: 0,
    missingItems: 0
  }
  
  const meals = await database.getAllMeals()
  result.totalMeals = meals.length
  
  for (const meal of meals) {
    try {
      // Validate if both groups and items exist
      if (meal.groups && meal.items) {
        // Comparar macros calculados
        const legacyMacros = calculateMacrosFromGroups(meal.groups)
        const unifiedMacros = calculateMacrosFromItems(meal.items)
        
        if (!macrosAreEqual(legacyMacros, unifiedMacros)) {
          result.macroDiscrepancies++
          result.dataIntegrityIssues.push(
            `Meal ${meal.id}: Macro discrepancy - Legacy: ${JSON.stringify(legacyMacros)}, Unified: ${JSON.stringify(unifiedMacros)}`
          )
        }
        
        // Check if item count is consistent
        const legacyItemCount = meal.groups.reduce((acc, group) => acc + group.items.length, 0)
        const unifiedItemCount = meal.items.length
        
        if (legacyItemCount !== unifiedItemCount) {
          result.missingItems++
          result.dataIntegrityIssues.push(
            `Meal ${meal.id}: Item count mismatch - Legacy: ${legacyItemCount}, Unified: ${unifiedItemCount}`
          )
        }
        
        result.successfulMigrations++
      } else if (!meal.items) {
        result.failedMigrations++
        result.dataIntegrityIssues.push(`Meal ${meal.id}: Missing unified items`)
      }
    } catch (error) {
      result.failedMigrations++
      result.dataIntegrityIssues.push(`Meal ${meal.id}: Validation error - ${error.message}`)
    }
  }
  
  return result
}
```

#### Migration Dashboard
```typescript
// tools/migration-dashboard.ts
export interface MigrationDashboard {
  timestamp: Date
  phase: 'preparation' | 'migration' | 'validation' | 'cleanup'
  metrics: {
    codebaseMetrics: {
      legacyFilesRemaining: number
      conversionUtilitiesCount: number
      testCoverage: number
      deprecationWarnings: number
    }
    dataMetrics: {
      totalRecords: number
      migratedRecords: number
      failureRate: number
      rollbacksExecuted: number
    }
    performanceMetrics: {
      averageResponseTime: number
      peakMemoryUsage: number
      queryPerformance: number
      conversionOverhead: number
    }
  }
  alerts: Array<{
    level: 'critical' | 'warning' | 'info'
    message: string
    timestamp: Date
  }>
}

export async function generateMigrationDashboard(): Promise<MigrationDashboard> {
  return {
    timestamp: new Date(),
    phase: 'migration', // Determine current phase
    metrics: {
      codebaseMetrics: await getCodebaseMetrics(),
      dataMetrics: await getDataMetrics(),
      performanceMetrics: await getPerformanceMetrics()
    },
    alerts: await getActiveAlerts()
  }
}
```

### Validation Checklist by Milestone

#### ✅ Milestone 1: Preparation - Checklist
- [ ] **Code Audit Completed**
  - [ ] Script de auditoria executado com 0 errors
  - [ ] Relatório de dependências legacy gerado
  - [ ] Plano de refatoração validado
  
- [ ] **Test Environment Configured**
  - [ ] Staging database with anonymized production data
  - [ ] CI/CD pipeline configured for migration tests
  - [ ] Métricas de baseline coletadas e documentadas
  
- [ ] **Migration Scripts Developed**
  - [ ] SQL migration script tested in local environment
  - [ ] Script de rollback validado
  - [ ] Automated backup procedures

#### ✅ Milestone 2: Database Migration - Checklist
- [ ] **Schema Migration Executed**
  - [ ] New `items` column added successfully
  - [ ] Indexes created for query optimization
  - [ ] Validation constraints implemented
  
- [ ] **Data Migration Validated**
  - [ ] 100% of records migrated without error
  - [ ] Integrity validator executed with score > 99%
  - [ ] Macro comparison passed all tests
  - [ ] Query performance maintained or improved
  
- [ ] **Gradual Deployment Executed**
  - [ ] Canary deployment (5%) executed successfully
  - [ ] Error metrics < 0.1%
  - [ ] Rollout to 100% completed

#### ✅ Milestone 3: Internal Refactoring - Checklist  
- [ ] **Documentation Updated**
  - [ ] Main README updated with migration guide
  - [ ] Changelog documents planned breaking changes

#### ✅ Milestone 4: Internal Refactoring - Checklist
- [ ] **Runtime Conversions Eliminated**
  - [ ] All database queries return unified format
  - [ ] Application services removed conversion calls
  - [ ] Performance improved by at least 10%
  
- [ ] **Legacy Code Removed**
  - [ ] Legacy domain files removed
  - [ ] Unnecessary conversion utilities eliminated
  - [ ] Legacy imports refactored to UnifiedItem
  
- [ ] **Tests Updated**
  - [ ] Test suite adapted for UnifiedItem
  - [ ] Coverage maintained at 90%+
  - [ ] Integration tests validating end-to-end behavior

## Immediate Next Steps

### Approval and Planning (Current Week)
1. **Technical Review**: Validate plan architecture and approach
2. **Timeline Confirmation**: Validate maintenance windows and deadlines

### Sprint Preparation (Next 2 Weeks)
1. **Environment Setup**: Configure staging with production data
2. **Script Development**: Create and test migration scripts
3. **Tooling Development**: Implement dashboards and monitoring systems

### Migration Execution (After Approval)
1. **Phase 1**: Preparation and audit (2 weeks)
2. **Phase 2**: Gradual database migration (2 weeks)
3. **Phase 3**: Internal refactoring and cleanup (4 weeks)

## Residual Risks and Mitigations

### Uncovered Technical Risks
- **Corrupted Data**: Records with inconsistent format in database
  - *Mitigation*: Data cleaning scripts + manual intervention procedures
- **Migration Performance**: Very slow migration in production
  - *Mitigation*: Parallel processing + batch optimization

### Business Risks
- **User Experience**: Interface changes confusing users
  - *Mitigation*: Keep UX identical during transition + gradual rollout
- **Market Timing**: Migration delaying important feature releases
  - *Mitigation*: Parallel development tracks + feature flags

## Pre-Migration Checklist
- [ ] Backup strategy validated and tested
- [ ] Rollback procedures tested in staging
- [ ] Monitoring dashboards deployed and tested
- [ ] Feature flags configured and tested
- [ ] Database migration scripts validated
- [ ] Performance baselines established

## Migration Day Checklist  
- [ ] Backup initiated and verified
- [ ] Maintenance mode enabled (if required)
- [ ] Migration scripts executed successfully
- [ ] Data integrity validation passed
- [ ] Performance metrics within acceptable range
- [ ] Feature flags updated to enable unified mode
- [ ] Monitoring dashboards showing green status
- [ ] Sample user flows tested manually
- [ ] Maintenance mode disabled

## Post-Migration Checklist
- [ ] Performance metrics trending positively
- [ ] Error rates within normal parameters
- [ ] Application functionality verified
- [ ] Documentation updated with lessons learned
