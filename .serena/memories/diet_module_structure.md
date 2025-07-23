# Diet Module Structure

The diet module is the core of the Macroflows application, containing all nutrition-related functionality. It's the largest and most complex module with multiple sub-modules.

## Sub-modules Overview

### 1. **day-diet** - Daily diet management
- **Purpose**: Manages daily nutrition tracking and meal organization
- **Key Files**:
  - `domain/dayDiet.ts` - DayDiet entity and schemas
  - `domain/dayDietOperations.ts` - Business logic for day diet operations
  - `application/dayDiet.ts` - SolidJS reactive state management
  - `infrastructure/supabaseDayRepository.ts` - Database integration
- **Features**: Day creation, meal management, macro tracking, day change detection

### 2. **food** - Food database management
- **Purpose**: Core food entity management with external API integration
- **Key Files**:
  - `domain/food.ts` - Food entity and validation
  - `application/food.ts` - Food fetching and caching
  - `infrastructure/supabaseFoodRepository.ts` - Database operations
  - `infrastructure/api/` - External food API integration
- **Features**: Food search, EAN scanning, API food imports, caching

### 3. **unified-item** - Complex item hierarchy system
- **Purpose**: Unified type system for foods, recipes, and groups
- **Key Files**:
  - `schema/unifiedItemSchema.ts` - Discriminated union types
  - `domain/conversionUtils.ts` - Type conversions
  - `domain/treeUtils.ts` - Tree traversal utilities
  - `domain/validateItemHierarchy.ts` - Validation logic
- **Features**: Type-safe item hierarchy, tree operations, validation

### 4. **recipe** - Recipe management
- **Purpose**: Recipe creation, management, and scaling
- **Key Files**:
  - `domain/recipe.ts` - Recipe entities (legacy and unified)
  - `domain/recipeOperations.ts` - Recipe business logic
  - `application/recipe.ts` - Recipe state management
  - `infrastructure/supabaseRecipeRepository.ts` - Database operations
- **Features**: Recipe CRUD, scaling, unified recipe system

### 5. **item** - Individual food items
- **Purpose**: Individual item management within meals
- **Key Files**:
  - `domain/item.ts` - Item entity definition
  - `application/item.ts` - Item operations
- **Features**: Item quantity updates, meal integration

### 6. **meal** - Meal management
- **Purpose**: Meal structure and item organization
- **Key Files**:
  - `domain/meal.ts` - Meal entity and schemas
  - `domain/mealOperations.ts` - Meal business logic
  - `application/meal.ts` - Meal state management
- **Features**: Meal CRUD, item management, group operations

### 7. **item-group** - Item grouping system
- **Purpose**: Grouping items within meals for organization
- **Key Files**:
  - `domain/itemGroup.ts` - Group entity types
  - `domain/itemGroupOperations.ts` - Group operations
  - `application/itemGroupService.ts` - Group services
- **Features**: Simple and reciped groups, item management

### 8. **macro-nutrients** - Macro nutrient calculations
- **Purpose**: Macro nutrient validation and calculations
- **Key Files**:
  - `domain/macroNutrients.ts` - MacroNutrients entity
  - `domain/macroNutrientsErrors.ts` - Validation errors
- **Features**: Macro validation, calculation logic

### 9. **macro-profile** - User macro profiles
- **Purpose**: User-specific macro targets and profiles
- **Key Files**:
  - `domain/macroProfile.ts` - MacroProfile entity
  - `application/macroProfile.ts` - Profile management
  - `infrastructure/supabaseMacroProfileRepository.ts` - Database operations
- **Features**: Profile CRUD, macro target calculation

### 10. **macro-target** - Macro target calculations
- **Purpose**: Calculate daily macro targets based on profiles
- **Key Files**:
  - `application/macroTarget.ts` - Target calculation logic
- **Features**: Daily macro target calculation

### 11. **template** - Template system
- **Purpose**: Template-based item creation
- **Key Files**:
  - `domain/template.ts` - Template types
  - `application/templateToItem.ts` - Template to item conversion
- **Features**: Template creation, item generation

### 12. **template-item** - Template item types
- **Purpose**: Template item type definitions
- **Key Files**:
  - `domain/templateItem.ts` - Template item types
- **Features**: Template item validation

### 13. **api** - External API integration
- **Purpose**: External food API constants and configuration
- **Key Files**:
  - `constants/apiSecrets.ts` - API configuration
- **Features**: API endpoints, authentication