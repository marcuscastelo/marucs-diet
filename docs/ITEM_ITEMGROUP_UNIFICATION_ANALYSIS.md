# Item/ItemGroup Unification Analysis

**Author**: Architecture Analyst v2  
**Date**: 2025-06-17  
**Status**: Planning Phase  
**Target Milestone**: v0.13.0  

## Executive Summary

This document analyzes the feasibility and strategy for unifying the `Item` and `ItemGroup` entities into a single hierarchical structure to support future recursive recipes and eliminate semantic contradictions in the current architecture.

## Current Architecture Issues

### Semantic Contradictions

1. **Item Reference Inconsistency**
   - `Item.reference` points to either Food OR Recipe
   - **Food**: static, no components → Item is a "leaf"
   - **Recipe**: dynamic, with components → Item should have "children"
   - **Problem**: Same type for fundamentally different references

2. **ItemGroup as UI Workaround**
   - Not a real domain entity
   - Exists to avoid multi-stage modals (Item → Recipe)
   - Represents temporary "recipe under construction"
   - Will break with recursive recipes

3. **Future Hierarchy Requirements**
   ```
   Recipe
   ├── SubRecipe A
   │   ├── Food 1
   │   └── Food 2
   └── SubRecipe B
       ├── Food 3
       └── SubRecipe C
           └── Food 4
   ```

## Proposed Unified Structure

### Schema Design

```typescript
type UnifiedItem = {
  id: number
  name: string
  quantity: number
  macros: MacroNutrients
  
  // Discriminated union based on reference type
  reference: {
    type: 'food'
    id: number
  } | {
    type: 'recipe' 
    id: number
    children: UnifiedItem[]  // Recipe components
  } | {
    type: 'group'
    children: UnifiedItem[]  // Temporary group (UI)
  }
  
  __type: 'Item'
}
```

### Type Guards

```typescript
function isFood(item: UnifiedItem): item is UnifiedItem & { reference: { type: 'food' } }
function isRecipe(item: UnifiedItem): item is UnifiedItem & { reference: { type: 'recipe' } }
function isGroup(item: UnifiedItem): item is UnifiedItem & { reference: { type: 'group' } }
```

## Benefits Analysis

### Strategic Benefits

1. **Future-Proof Architecture**
   - ✅ Already supports infinite hierarchy
   - ✅ Eliminates future refactor for recursive recipes
   - ✅ Semantic consistency: reference.type determines behavior

2. **Conceptual Simplicity**
   - ✅ One entity, multiple behaviors based on `reference.type`
   - ✅ Eliminates Item vs ItemGroup vs Recipe confusion
   - ✅ Natural hierarchy with children

3. **Code Reduction**
   - ✅ Unified operations: add/remove/update work on children
   - ✅ Unified UI components: same component for any level
   - ✅ Simplified calculations: natural recursion in macros

4. **Future Flexibility**
   - ✅ Easy to add new types: 'meal-template', 'day-template', etc.
   - ✅ Natural copy/paste: any item can be copied anywhere
   - ✅ Simple conversions: Food → Recipe is just changing `reference.type`

## Implementation Strategy

### Timeline Comparison

#### Current Approach (3 refactors):
1. Add `children` to ItemGroup → Refactor current structure
2. Implement Recipe recursion → New refactor
3. Eventually unify → Third refactor
**Total**: 3 major refactors, permanent semantic inconsistency

#### Unified Approach (1 refactor):
1. Unify Item/ItemGroup with hierarchical structure
2. Recursive recipes become configuration only
**Total**: 1 major refactor, solid foundation

### Implementation Phases

#### Phase 1: Schema & Domain (v0.13.0)
- [ ] Create unified schema in parallel
- [ ] Implement domain operations
- [ ] Add comprehensive tests
- [ ] Feature flag for new structure

#### Phase 2: Infrastructure (v0.13.0)
- [ ] Database migrations
- [ ] DAO layer updates
- [ ] Repository pattern updates
- [ ] Data consistency validation

#### Phase 3: Application Layer (v0.13.0)
- [ ] Service layer updates
- [ ] Business logic migration
- [ ] API endpoint updates
- [ ] Integration tests

#### Phase 4: UI Migration (v0.13.0)
- [ ] Component updates
- [ ] Modal system redesign
- [ ] Copy/paste functionality
- [ ] User acceptance testing

#### Phase 5: Cleanup (v0.14.0)
- [ ] Remove old structure
- [ ] Performance optimizations
- [ ] Documentation updates
- [ ] Final validation

## Risk Assessment

### High Risks
- **Data Migration Complexity**: 35+ files to update
- **UI Regression**: Complex modal interactions
- **Performance Impact**: More complex queries

### Mitigation Strategies
- **Gradual Migration**: Feature flags and parallel implementation
- **Comprehensive Testing**: Unit, integration, and user testing
- **Rollback Plan**: Ability to revert to old structure
- **Performance Monitoring**: Query optimization and indexing

## Cost-Benefit Analysis

### Costs
- **Development Time**: 3-4 months (same as recursive recipes would require)
- **Risk Level**: High (but necessary anyway for future features)
- **Testing Effort**: Extensive (but prevents future debt)

### Benefits
- **Eliminates Future Refactor**: No need for separate recursive recipe implementation
- **Solid Architecture**: Foundation for advanced features
- **Reduced Complexity**: Single entity model
- **Technical Debt Reduction**: Eliminates semantic contradictions

## Recommendation

**✅ APPROVED** for implementation in v0.13.0

### Rationale
With the context of recursive recipes, unification changes from "unnecessary technical debt" to **essential strategic investment**. The current semantic contradictions will only worsen with advanced features.

Better to solve this in a planned manner now than face multiple fragmented refactors in the future.

### Prerequisites
- Mobile app (v0.12.0) must be stable
- Comprehensive prototype (1-2 weeks) to validate approach
- Feature flag strategy for safe rollback

## Implementation Tracking

- **Epic**: Item/ItemGroup Unification
- **Milestone**: v0.13.0 (Production Mobile)
- **Issues**: See GitHub issues with label `architecture` and `refactor`
- **Status**: Planning phase, awaiting approval

---

## References

- [Domain Audit - Item](./audit_domain_diet_item.md)
- [Domain Audit - ItemGroup](./audit_domain_diet_item-group.md)
- [Sections Audit - Item-Group](./audit_sections_item-group.md)
- [Architecture Guide](./ARCHITECTURE_GUIDE.md)
