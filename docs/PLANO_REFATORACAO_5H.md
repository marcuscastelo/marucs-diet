# Plano Detalhado de Refatoração e Melhoria – Sessão de 5h (60+ Commits)

## Objetivo
Refatorar, modularizar e alinhar a arquitetura do projeto conforme os audits, removendo lógica de domínio dos componentes UI, eliminando utilitários legados, padronizando contratos de repositório, melhorando testes e documentação. O plano é granular para garantir 60+ commits atômicos.

---

## 1. Preparação e Organização
- Crie uma branch `refactor/domain-ui-separation`.
- Adicione um checklist de progresso em `/docs/REFATORACAO_PROGRESSO.md`.
- Atualize/adicione um `README` temporário em `/docs/` com o escopo da refatoração.

## 2. Remoção de Geração de ID do Domínio
- Remova `generateId` de todos os domínios (`item.ts`, `item-group.ts`, `meal.ts`, `recipe.ts`).
- Atualize testes para IDs injetados.
- Atualize documentação de cada submódulo (`docs/audit_domain_diet_*.md`).

## 3. Definição e Padronização de Interfaces de Repositório
- Crie/atualize interfaces de repositório para todos os domínios relevantes:
  - `ItemRepository`, `ItemGroupRepository`, `MealRepository`, `RecipeItemRepository`, `TemplateItemRepository`, `TemplateRepository`, `ApiModelRepository`, `RecentFoodRepository`, `MacroNutrientsRepository`.
- Atualize domínios e testes para usar as novas interfaces.

## 4. Isolamento de Lógica de Transformação/Validação
- Extraia lógica de transformação (ex: `__type`, parsing de datas) de schemas Zod para utilitários em `src/shared/domainTransformers/`.
- Atualize domínios e testes para usar os novos utilitários.

## 5. Padronização de Erros de Domínio
- Crie classes de erro customizadas para invariantes de domínio em `src/shared/domainErrors/`.
- Atualize domínios e testes para lançar erros customizados.

## 6. Refatoração dos Componentes UI (Separation of Concerns)
### 6.1. Day-Diet
- Extraia cálculos de macros/calorias de `sections/day-diet/DayMacros.tsx` para hooks em `src/modules/diet/application/hooks/`.
- Atualize componente e testes.

### 6.2. Food-Item
- Extraia validação e lógica de macro overflow de `sections/food-item/ItemEditModal.tsx` para hook.
- Atualize componente e testes.

### 6.3. Item-Group
- Extraia lógica de clipboard, schema e ID regeneration para hooks/utilitários compartilhados.
- Atualize componente e testes.

### 6.4. Meal/Recipe
- Extraia lógica duplicada de clipboard/schema de `MealEditView` e `RecipeEditView` para hooks/utilitários.
- Atualize ambos componentes e testes.

### 6.5. Macro-Nutrients/Profile/Weight
- Extraia cálculos de macros, calorias e evolução de peso de componentes para hooks.
- Atualize componentes e testes.

### 6.6. Datepicker
- Extraia parsing/formatação de datas de componentes para utilitários/hooks.
- Atualize componentes e testes.

### 6.7. Barcode
- Extraia configuração/validação de scanner para hook compartilhado.
- Atualize componentes e testes.

## 7. Remoção de Utilitários Legados
- Liste todos os imports de `legacy/` e `shared/` em domínio/aplicação.
- Remova uso de `idUtils`, `macroMath`, `macroProfileUtils`, `weightUtils` dos domínios, aplicação e UI.
- Atualize documentação de migração em `/docs/audit_shared_legacy.md`.

## 8. Padronização de Imports
- Atualize todos os imports para usar caminhos absolutos (`~/...`).
- Remova imports relativos e dinâmicos.
- Atualize testes para refletir mudanças de import.

## 9. Testes e Cobertura
- Adicione testes para novos hooks/utilitários.
- Atualize testes de integração para refletir boundaries UI/application/domain.
- Gere relatório de cobertura e salve em `/docs/TEST_COVERAGE.md`.

## 10. Documentação e JSDoc
- Atualize/adicione JSDoc para todos os tipos/funções exportados alterados.
- Remova JSDoc obsoletos.
- Atualize documentação de arquitetura em `/docs/ARCHITECTURE_GUIDE.md` e `/docs/ARCHITECTURE_AUDIT.md`.

## 11. Checagem Final e Cleanup
- Rode `npm run check` e corrija todos os erros.
- Remova props, imports e signals não usados após refatoração.
- Atualize `/docs/REFATORACAO_PROGRESSO.md` com status final.
- Atualize changelog/versão em `src/app-version.json` e `src/app-version.ts`.

## 12. Labels, Issues e PR
- Atualize/adicione labels em issues conforme `docs/labels-usage.md`.
- Gere issues de follow-up para pontos não resolvidos.
- Atualize o template de PR para incluir checklist de arquitetura e cobertura.
- Abra PR com descrição detalhada e checklist.

---

## Templates dos 60 Commits e Arquivos Envolvidos

### 1. Preparação e Organização
1. chore: create refactor branch and progress checklist
   - docs/REFATORACAO_PROGRESSO.md
2. docs: add temporary refactor scope to README
   - README.md
3. docs: add refactor progress checklist
   - docs/REFATORACAO_PROGRESSO.md

### 2. Remoção de Geração de ID do Domínio
4. refactor(domain): remove generateId from item domain
   - src/modules/diet/item.ts
   - src/modules/diet/item.test.ts
5. refactor(domain): remove generateId from item-group domain
   - src/modules/diet/item-group.ts
   - src/modules/diet/item-group.test.ts
6. refactor(domain): remove generateId from meal domain
   - src/modules/diet/meal.ts
   - src/modules/diet/meal.test.ts
7. refactor(domain): remove id generation from recipe domain
   - src/modules/diet/recipe.ts
   - src/modules/diet/recipe.test.ts
8. test: update item domain tests for injected ids
   - src/modules/diet/item.test.ts
9. test: update item-group domain tests for injected ids
   - src/modules/diet/item-group.test.ts
10. test: update meal domain tests for injected ids
    - src/modules/diet/meal.test.ts
11. test: update recipe domain tests for injected ids
    - src/modules/diet/recipe.test.ts
12. docs: update audit docs for id generation removal
    - docs/audit_domain_diet_item.md
    - docs/audit_domain_diet_item-group.md
    - docs/audit_domain_diet_meal.md
    - docs/audit_domain_diet_recipe.md

### 3. Definição e Padronização de Interfaces de Repositório
13. feat(domain): add ItemRepository interface
    - src/modules/diet/itemRepository.ts
    - src/modules/diet/item.ts
14. feat(domain): add ItemGroupRepository interface
    - src/modules/diet/itemGroupRepository.ts
    - src/modules/diet/item-group.ts
15. feat(domain): add MealRepository interface
    - src/modules/diet/mealRepository.ts
    - src/modules/diet/meal.ts
16. feat(domain): add RecipeItemRepository interface
    - src/modules/diet/recipeItemRepository.ts
    - src/modules/diet/recipe-item.ts
17. feat(domain): add TemplateItemRepository interface
    - src/modules/diet/templateItemRepository.ts
    - src/modules/diet/template-item.ts
18. feat(domain): add TemplateRepository interface
    - src/modules/diet/templateRepository.ts
    - src/modules/diet/template.ts
19. feat(domain): add ApiModelRepository interface
    - src/modules/diet/apiModelRepository.ts
    - src/modules/diet/api.ts
20. feat(domain): add RecentFoodRepository interface
    - src/modules/recent-food/recentFoodRepository.ts
    - src/modules/recent-food/recentFood.ts
21. feat(domain): add MacroNutrientsRepository interface
    - src/modules/diet/macroNutrientsRepository.ts
    - src/modules/diet/macro-nutrients.ts
22. test: update tests to use new repository interfaces
    - src/modules/diet/item.test.ts
    - src/modules/diet/item-group.test.ts
    - src/modules/diet/meal.test.ts
    - src/modules/diet/recipe.test.ts
    - src/modules/diet/template.test.ts
    - src/modules/recent-food/recentFood.test.ts
    - src/modules/diet/macro-nutrients.test.ts

### 4. Isolamento de Lógica de Transformação/Validação
23. refactor(domain): extract transformation logic to shared/domainTransformers
    - src/shared/domainTransformers/itemTransformers.ts
    - src/modules/diet/item.ts
24. refactor(domain): extract transformation logic for item-group
    - src/shared/domainTransformers/itemGroupTransformers.ts
    - src/modules/diet/item-group.ts
25. refactor(domain): extract transformation logic for meal
    - src/shared/domainTransformers/mealTransformers.ts
    - src/modules/diet/meal.ts
26. refactor(domain): extract transformation logic for recipe
    - src/shared/domainTransformers/recipeTransformers.ts
    - src/modules/diet/recipe.ts
27. refactor(domain): extract transformation logic for template
    - src/shared/domainTransformers/templateTransformers.ts
    - src/modules/diet/template.ts
28. test: add tests for new domain transformers
    - src/shared/domainTransformers/itemTransformers.test.ts
    - src/shared/domainTransformers/mealTransformers.test.ts
    - etc.

### 5. Padronização de Erros de Domínio
29. feat(domain): add custom domain error classes
    - src/shared/domainErrors/DomainInvariantError.ts
    - src/shared/domainErrors/ValidationError.ts
30. refactor(domain): use custom errors in item domain
    - src/modules/diet/item.ts
31. refactor(domain): use custom errors in item-group domain
    - src/modules/diet/item-group.ts
32. refactor(domain): use custom errors in meal domain
    - src/modules/diet/meal.ts
33. refactor(domain): use custom errors in recipe domain
    - src/modules/diet/recipe.ts
34. test: update tests for custom domain errors
    - src/modules/diet/item.test.ts
    - src/modules/diet/item-group.test.ts
    - src/modules/diet/meal.test.ts
    - src/modules/diet/recipe.test.ts

### 6. Refatoração dos Componentes UI (Separation of Concerns)
#### 6.1. Day-Diet
35. refactor(ui): extract macro/calorie logic from DayMacros to hook
    - sections/day-diet/DayMacros.tsx
    - src/modules/diet/application/hooks/useDayMacros.ts
36. test: add tests for useDayMacros
    - src/modules/diet/application/hooks/useDayMacros.test.ts

#### 6.2. Food-Item
37. refactor(ui): extract validation/macro overflow from ItemEditModal to hook
    - sections/food-item/ItemEditModal.tsx
    - src/modules/diet/application/hooks/useItemEdit.ts
38. test: add tests for useItemEdit
    - src/modules/diet/application/hooks/useItemEdit.test.ts

#### 6.3. Item-Group
39. refactor(ui): extract clipboard/schema/id logic from ItemGroupEditModal to hooks
    - sections/item-group/ItemGroupEditModal.tsx
    - src/modules/diet/application/hooks/useItemGroupEdit.ts
    - src/shared/hooks/useClipboard.ts
40. test: add tests for useItemGroupEdit/useClipboard
    - src/modules/diet/application/hooks/useItemGroupEdit.test.ts
    - src/shared/hooks/useClipboard.test.ts

#### 6.4. Meal/Recipe
41. refactor(ui): extract clipboard/schema logic from MealEditView to hooks
    - sections/meal/MealEditView.tsx
    - src/modules/diet/application/hooks/useMealEdit.ts
42. refactor(ui): extract clipboard/schema logic from RecipeEditView to hooks
    - sections/recipe/RecipeEditView.tsx
    - src/modules/diet/application/hooks/useRecipeEdit.ts
43. test: add tests for useMealEdit/useRecipeEdit
    - src/modules/diet/application/hooks/useMealEdit.test.ts
    - src/modules/diet/application/hooks/useRecipeEdit.test.ts

#### 6.5. Macro-Nutrients/Profile/Weight
44. refactor(ui): extract macro/weight logic from MacroTargets/Profile/WeightEvolution to hooks
    - sections/macro-nutrients/MacroTargets.tsx
    - sections/profile/MacroEvolution.tsx
    - sections/weight/WeightEvolution.tsx
    - src/modules/diet/application/hooks/useMacroTargets.ts
    - src/modules/weight/application/hooks/useWeightEvolution.ts
45. test: add tests for macro/weight hooks
    - src/modules/diet/application/hooks/useMacroTargets.test.ts
    - src/modules/weight/application/hooks/useWeightEvolution.test.ts

#### 6.6. Datepicker
46. refactor(ui): extract date logic from Datepicker to shared hook
    - sections/datepicker/Datepicker.tsx
    - src/shared/hooks/useDateUtils.ts
47. test: add tests for useDateUtils
    - src/shared/hooks/useDateUtils.test.ts

#### 6.7. Barcode
48. refactor(ui): extract scanner logic from BarCodeReader to hook
    - sections/barcode/BarCodeReader.tsx
    - src/shared/hooks/useBarcodeScanner.ts
49. test: add tests for useBarcodeScanner
    - src/shared/hooks/useBarcodeScanner.test.ts

### 7. Remoção de Utilitários Legados
50. chore: list all legacy/shared imports in domain/application
    - docs/audit_shared_legacy.md
51. refactor(domain): remove legacy idUtils/macroMath from domain
    - src/modules/diet/item.ts
    - src/modules/diet/item-group.ts
    - src/modules/diet/meal.ts
    - src/modules/diet/recipe.ts
52. refactor(app): remove legacy macroMath/macroProfileUtils/weightUtils from application
    - src/modules/diet/application/
    - src/modules/weight/application/
53. refactor(ui): remove legacy utils from UI
    - sections/day-diet/DayMacros.tsx
    - sections/profile/MacroEvolution.tsx
    - sections/weight/WeightEvolution.tsx
54. docs: update migration plan for legacy utilities
    - docs/audit_shared_legacy.md

### 8. Padronização de Imports
55. refactor: update all imports to use absolute paths
    - Todos arquivos src/ e sections/ (batch)
56. refactor: remove relative and dynamic imports
    - Todos arquivos src/ e sections/ (batch)
57. test: update tests for import changes
    - Todos arquivos de teste afetados

### 9. Testes e Cobertura
58. test: add tests for new shared/application hooks
    - src/shared/hooks/
    - src/modules/diet/application/hooks/
    - src/modules/weight/application/hooks/
59. test: update integration tests for new boundaries
    - src/ e sections/ (testes de integração)
60. chore: generate and document test coverage
    - docs/TEST_COVERAGE.md

### 10. Documentação e JSDoc
61. docs: update/add JSDoc for all exported types/functions
    - Todos arquivos exportados alterados
62. docs: remove outdated JSDoc
    - Todos arquivos exportados alterados
63. docs: update architecture docs
    - docs/ARCHITECTURE_GUIDE.md
    - docs/ARCHITECTURE_AUDIT.md

### 11. Checagem Final e Cleanup
64. chore: run npm run check and fix all errors
    - Todos arquivos afetados
65. refactor: remove unused props, imports, signals
    - Todos arquivos afetados
66. docs: update refactor progress checklist
    - docs/REFATORACAO_PROGRESSO.md
67. chore: update app version and changelog
    - src/app-version.json
    - src/app-version.ts

### 12. Labels, Issues e PR
68. chore: update/add labels in issues
    - Issues no repositório (manual ou script)
69. chore: create follow-up issues for unresolved points
    - Issues no repositório (manual ou script)
70. chore: update PR template with architecture/test checklist
    - .github/PULL_REQUEST_TEMPLATE.md (ou similar)
71. chore: open PR with detailed description and checklist
    - PR no repositório (manual)

---

Cada commit deve ser pequeno, atômico e descritivo. Sempre rode `npm run check` após grandes refatorações. Atualize testes e documentação a cada mudança relevante. Use hooks/utilitários compartilhados para evitar duplicação. Siga as instruções de importação, JSDoc e boundaries de arquitetura.

Este plano cobre 60+ commits atômicos, garantindo rastreabilidade, qualidade e alinhamento arquitetural.
