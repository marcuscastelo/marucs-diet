# Component Duplication Analysis Prompt

## Objective
Perform a comprehensive analysis of component duplication in a codebase and determine if unification is worthwhile, following a structured approach with clear criteria for decision-making.

## Instructions

### Phase 1: Discovery and Mapping

#### 1.1 Systematic Search Strategy
**Semantic Searches:**
```
semantic_search("duplicate components similar patterns repeated code")
semantic_search("button component variations")
semantic_search("modal dialog popup components") 
semantic_search("chart visualization components")
semantic_search("clipboard copy paste functionality")
semantic_search("context menu actions")
semantic_search("layout container wrapper components")
```

**File Pattern Searches:**
```
file_search("**/*Button*.{tsx,ts}")
file_search("**/*Modal*.{tsx,ts}")
file_search("**/*Chart*.{tsx,ts}")
file_search("**/*View*.{tsx,ts}")
file_search("**/*Layout*.{tsx,ts}")
file_search("**/*List*.{tsx,ts}")
file_search("**/*Item*.{tsx,ts}")
```

**Targeted Grep Searches:**
```
grep_search("className.*button", isRegexp=true)
grep_search("copy.*clipboard", isRegexp=true)
grep_search("context.*menu", isRegexp=true)
grep_search("chart.*config", isRegexp=true)
grep_search("modal.*dialog", isRegexp=true)
```

#### 1.2 Categorize Findings
Organize discoveries into categories:
- **UI Components** (buttons, modals, forms, tooltips)
- **View/Layout Components** (item views, list views, containers)
- **Logic/Hook Duplications** (clipboard, validation, state management)
- **Chart/Visualization Components** (graphs, charts, indicators)
- **Context Menu/Navigation Components** (menus, actions, navigation)
- **Utility Functions** (formatters, validators, helpers)

### Phase 2: Detailed Analysis per Category

For each category, analyze:

#### A. Duplication Assessment
- **Lines of duplicated code** (quantify the impact)
- **Percentage similarity** (>90%, 70-90%, 50-70%, <50%)
- **Number of locations** where duplication occurs
- **Complexity of the duplicated logic**
- **Maintenance burden** (how often these components change)

#### B. Unification Feasibility
- **Domain coupling**: Do components belong to different domains?
- **Behavior differences**: Are variations intentional or accidental?
- **Props compatibility**: Can differences be abstracted as props?
- **TypeScript complexity**: Would generics add unnecessary complexity?
- **Testing impact**: How would testing strategy change?
- **Performance considerations**: Bundle size, runtime optimization

#### C. Risk vs. Benefit Analysis
Use a scoring system (1-5 scale):

**Benefits (weight each 1-5):**
- **Maintainability**: Fewer places to update
- **Consistency**: Unified UX/behavior
- **Reusability**: Potential for broader use
- **Testability**: Centralized test coverage
- **Performance**: Bundle optimization potential

**Costs (weight each 1-5):**
- **Implementation complexity**: Development effort
- **Breaking changes**: Migration difficulty
- **Abstraction overhead**: Added complexity
- **Risk of regression**: Chance of breaking existing features
- **Team learning curve**: Adoption difficulty

**Decision Formula:**
```
Score = (Sum of Benefits) - (Sum of Costs)
≥8: High Priority (Vale a pena)
4-7: Medium Priority (Talvez)
≤3: Low Priority (Não vale a pena)
```

### Phase 3: Decision Framework

Use this criteria matrix:

#### ✅ **DEFINITELY UNIFY** (High Priority)
- **>90% code similarity**
- **200+ lines of duplication**
- **Pure markup/styling with no domain logic**
- **Existing proven patterns (hooks, utilities)**
- **Low TypeScript complexity**

#### ✅ **WORTH UNIFYING** (Medium Priority) 
- **70-90% code similarity**
- **100+ lines of duplication**
- **Differences can be abstracted as props**
- **Clear design system benefits**
- **Low to medium complexity**

#### ⚠️ **INVESTIGATE FIRST** (Maybe)
- **50-70% code similarity**
- **Benefits unclear vs. complexity**
- **Domain boundaries might be violated**
- **Team consensus needed**
- **Proof of concept required**

#### ❌ **DON'T UNIFY** (Avoid)
- **<50% code similarity**
- **Different domain responsibilities**
- **High TypeScript generic complexity**
- **Loss of component clarity**
- **Over-engineering risk**

### Phase 4: Issue Creation and Documentation

#### 4.1 Issue Template (REFACTOR type)
For each "Vale a pena" and "Talvez" case, create issues following this structure:

```markdown
# [REFACTOR] <Descriptive Title>

## 🎯 Motivação
<Clear explanation of the duplication problem>

## 📋 Descrição
<Technical details of the duplication and current impact>

## ✅ Critérios de Aceitação
- [ ] <Specific, testable criterion>
- [ ] <Specific, testable criterion>
- [ ] <Specific, testable criterion>

## 🔍 Análise de Risco
**Nível de Risco**: <Baixo/Médio/Alto>

**Riscos Identificados**:
- <Specific risk>

**Mitigações**:
- <Mitigation strategy>

## 📝 Notas Técnicas
<Implementation details, affected files, special considerations>

## 🏷️ Labels Sugeridas
- `refactor`
- `complexity-<low/medium/high/very-high>`
- `<affected-area>`
```

#### 4.2 Required Labels
Always include:
- **Main type**: `refactor`
- **Complexity**: `complexity-low`, `complexity-medium`, `complexity-high`, `complexity-very-high`
- **Area**: `ui`, `backend`, `api`, `performance`, etc.
- **Status**: `todo :spiral_notepad:` (initially)

#### 4.3 Issue Scope Guidelines
- **Atomic**: Small, testable scope
- **Independent**: Can be implemented without dependencies
- **Specific**: Focus on one type of duplication
- **Measurable**: Clear acceptance criteria

#### 4.4 Creating Issues with GitHub CLI
```bash
# Example command structure
gh issue create \
  --title "[REFACTOR] <Title>" \
  --body-file issue-content.md \
  --label "refactor,complexity-medium,ui,todo :spiral_notepad:"
```

### Phase 5: Implementation Roadmap

#### 5.1 Roadmap Structure
Create a phased approach:

```markdown
# Component Unification Roadmap

## Phase 1: Foundation (P0 - Immediate)
High-impact, low-risk improvements:
- [ ] <Issue link> - <Brief description>

## Phase 2: Core Components (P1 - Next Sprint)  
UI consistency and standardization:
- [ ] <Issue link> - <Brief description>

## Phase 3: Enhancement (P2 - Future)
Medium-priority improvements:
- [ ] <Issue link> - <Brief description>

## Phase 4: Investigation (P3 - Research)
Cases requiring further analysis:
- [ ] <Issue link> - <Brief description>

## Implementation Guidelines
- Follow smallest testable increment principle
- Maintain backward compatibility where possible
- Update tests for all changes
- Document migration strategies
- Use feature flags for risky changes

## Success Metrics
- Lines of code reduced: target reduction
- Files consolidated: before/after count
- Consistency improvements: specific UX/UI gains
- Developer experience: reduced cognitive load
```

#### 5.2 Prioritization Matrix
| Impact | Effort | Priority | Action |
|--------|--------|----------|--------|
| High | Low | P0 | Implement immediately |
| High | High | P1 | Plan for next sprint |
| Low | Low | P2 | Implement when available |
| Medium | Medium | P3 | Investigate first |
| Low | High | P4 | Do not implement |

### Phase 6: Output Format and Execution

#### 6.1 Required Terminal Setup
```bash
export GIT_PAGER=cat
```

#### 6.2 Validation Process
After any changes:
```bash
npm run copilot:check | tee /tmp/copilot-terminal-N 2>&1
# Wait for "COPILOT: All checks passed!" message
# Follow the 3-script validation process as per coding instructions
```

#### 6.3 Structured Analysis Output
Generate a comprehensive report:

```markdown
# Component Unification Analysis Report

reportedBy: duplication-analysis-agent.v1

## Executive Summary
- **Total duplication found**: X lines across Y files
- **Recommended unifications**: N high priority, M medium priority  
- **Estimated impact**: Lines saved, consistency improvements
- **Implementation phases**: 1, 2, 3 with timelines

## High Priority Unifications (✅ VALE A PENA)
### [Component Name]
- **Duplication**: X lines, Y% similarity, Z locations
- **Score**: X/10 (Benefits: Y, Costs: Z)
- **Risk**: Low | **Benefit**: High
- **Implementation**: [specific approach]
- **Issue**: [GitHub issue link]

## Medium Priority Unifications (✅ TALVEZ)
### [Component Name] 
- **Duplication**: X lines, Y% similarity, Z locations
- **Score**: X/10 (Benefits: Y, Costs: Z)
- **Risk**: Medium | **Benefit**: Medium
- **Implementation**: [specific approach]
- **Issue**: [GitHub issue link]

## Investigation Required (⚠️ INVESTIGAR)
### [Component Name]
- **Uncertainty**: [specific concerns]
- **Investigation needed**: [what to analyze]
- **Decision criteria**: [when to proceed]
- **Issue**: [GitHub issue link]

## Not Recommended (❌ NÃO VALE A PENA)
### [Component Name]
- **Reasons**: [why not to unify]
- **Score**: X/10 (too low)
- **Alternative**: [suggested approach]

## Created Issues Summary
- **Total issues created**: X
- **High priority**: N issues
- **Medium priority**: M issues  
- **Investigation**: K issues
- **All issues properly labeled and linked to roadmap**

## Implementation Roadmap
[Link to generated roadmap document]
```

#### 6.4 Reusable Prompt Generation
After completing the analysis, update this prompt with:
- Lessons learned from the specific codebase
- Adjustments to scoring criteria
- New patterns discovered
- Improved templates and workflows

## Project-Specific Guidelines

### Code Quality Standards
- **Architecture**: Follow Clean Architecture with domain/application separation
- **Language**: All code, comments, and commits in English
- **Imports**: Use absolute imports with `~/` prefix, never relative imports
- **JSDoc**: Update only for exported functions/types, remove outdated docs
- **Testing**: Update tests for all changes, ensure full coverage

### Technical Patterns
- **Component Structure**: SolidJS with TypeScript
- **Build System**: Vite with modern tooling
- **Styling**: Consistent design system patterns
- **State Management**: Global signals preferred over prop drilling
- **Error Handling**: Domain throws pure errors, Application calls handleApiError

### Issue and Commit Standards
- **Issue Scope**: Atomic, independent, testable
- **Commit Messages**: Conventional commits format in English
- **Labels**: Follow project label conventions (see docs/labels-usage.md)
- **Templates**: Use REFACTOR template for unification issues
- **Branches**: Create feature branches for each issue

## Additional Guidelines

### Technical Considerations
- **Always preserve existing functionality**
- **Maintain TypeScript type safety**
- **Consider performance implications**  
- **Plan for visual regression testing**
- **Document migration paths**
- **Use feature flags for risky changes**

### Team Considerations  
- **Get team consensus on complex abstractions**
- **Consider learning curve for new patterns**
- **Ensure code readability isn't compromised**
- **Plan for gradual adoption**
- **Document new patterns and conventions**

### Success Metrics
- **Quantitative**: Lines reduced, files consolidated, bundle size impact
- **Qualitative**: Maintainability, consistency, developer experience
- **Process**: Time to implement similar features in future
- **Quality**: Test coverage, bug reduction, regression prevention

## Common Pitfalls and Anti-Patterns

### Pitfalls to Avoid
1. **Over-engineering**: Creating abstractions more complex than original duplication
2. **Domain coupling**: Mixing unrelated business domains in shared components
3. **Generic overuse**: TypeScript generics that reduce code readability
4. **Premature optimization**: Unifying before patterns are truly stable
5. **All-or-nothing**: Not allowing for gradual migration strategies
6. **Ignoring context**: Not considering why duplication might have occurred
7. **Breaking changes**: Not planning backward compatibility strategies

### Red Flags
- Abstractions that are harder to understand than the original code
- Components that require extensive documentation to use correctly
- Shared components that change frequently due to diverse requirements
- Loss of component-specific optimizations or performance characteristics
- Increased debugging complexity or harder error tracing
- Teams avoiding the unified component and creating new duplications

### Warning Signs During Implementation
- Multiple developers asking "how do I use this component?"
- Frequent breaking changes to accommodate new use cases
- Performance regressions in specific scenarios
- Tests becoming significantly more complex
- New bugs appearing in previously stable features

## Methodology Validation

### Self-Check Questions
Before recommending unification:
1. **Is the abstraction simpler than the sum of its parts?**
2. **Would a new team member understand this easily?**
3. **Can we implement new similar features faster with this abstraction?**
4. **Does this reduce cognitive load for developers?**
5. **Are we solving a real problem or creating a theoretical one?**

### Validation Process
1. **Create proof of concept** for complex unifications
2. **Get team review** before implementation
3. **Test with realistic use cases** beyond current requirements
4. **Measure performance impact** if relevant
5. **Document migration strategy** with rollback plan

Use this comprehensive framework to systematically evaluate any codebase for component duplication opportunities while maintaining code quality, team productivity, and long-term maintainability.

## Reference Example

For a real-world application of this methodology, see the marucs-diet project analysis that identified:
- **7 unification opportunities** across UI components, logic patterns, and visualizations
- **Structured decision matrix** with clear scoring criteria
- **Phased implementation roadmap** with risk assessment
- **Complete issue creation workflow** with proper labels and templates
- **Reusable analysis process** captured in this prompt

This methodology successfully balanced aggressive consolidation opportunities with practical implementation constraints, resulting in actionable issues ready for team execution.
