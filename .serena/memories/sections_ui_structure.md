# Sections (UI Components) Structure

The sections directory contains page-level UI components and user-facing features organized by functional areas.

## UI Sections Overview

### 1. **common** - Shared UI components
- **Purpose**: Reusable UI components used across the application
- **Key Components**:
  - `components/Modal.tsx` - Modal component system
  - `components/buttons/` - Button components
  - `components/charts/` - Chart components
  - `components/icons/` - Icon components
  - `context/Providers.tsx` - Context providers
  - `hooks/` - Reusable UI hooks
- **Features**: Modal system, buttons, charts, icons, context providers

### 2. **day-diet** - Daily diet UI
- **Purpose**: UI components for daily diet management
- **Key Components**:
  - `components/DayMeals.tsx` - Day meals display
  - `components/DayMacros.tsx` - Day macros summary
  - `components/TopBar.tsx` - Day navigation bar
  - `components/CopyLastDayModal.tsx` - Copy previous day functionality
  - `components/DayChangeModal.tsx` - Day change detection
- **Features**: Day overview, meal display, macro summary, navigation

### 3. **unified-item** - Complex item UI
- **Purpose**: UI components for the unified item system
- **Key Components**:
  - `components/UnifiedItemView.tsx` - Item display
  - `components/UnifiedItemEditModal.tsx` - Item editing
  - `components/UnifiedItemActions.tsx` - Item actions
  - `components/QuantityControls.tsx` - Quantity management
  - `components/UnifiedItemChildren.tsx` - Child item display
- **Features**: Item display, editing, actions, quantity controls

### 4. **meal** - Meal management UI
- **Purpose**: UI components for meal management
- **Key Components**:
  - `components/MealEditView.tsx` - Meal editing interface
  - `context/MealContext.tsx` - Meal context provider
- **Features**: Meal editing, context management

### 5. **recipe** - Recipe management UI
- **Purpose**: UI components for recipe management
- **Key Components**:
  - `components/RecipeEditModal.tsx` - Recipe editing modal
  - `components/RecipeEditView.tsx` - Recipe editing interface
  - `components/UnifiedRecipeEditView.tsx` - Unified recipe editing
  - `context/RecipeEditContext.tsx` - Recipe context
- **Features**: Recipe editing, unified recipe system

### 6. **search** - Search UI
- **Purpose**: Search interface components
- **Key Components**:
  - `components/TemplateSearchBar.tsx` - Search input
  - `components/TemplateSearchModal.tsx` - Search modal
  - `components/TemplateSearchResults.tsx` - Search results display
  - `components/TemplateSearchTabs.tsx` - Search tabs
- **Features**: Search interface, results display, tabbed search

### 7. **profile** - User profile UI
- **Purpose**: User profile and statistics display
- **Key Components**:
  - `components/UserInfo.tsx` - User information display
  - `components/MacroEvolution.tsx` - Macro evolution charts
  - `components/WeightChartSection.tsx` - Weight chart display
  - `components/ProfileChartTabs.tsx` - Profile chart tabs
  - `measure/components/` - Body measurement components
- **Features**: Profile display, charts, measurements, evolution tracking

### 8. **weight** - Weight tracking UI
- **Purpose**: Weight tracking and chart display
- **Key Components**:
  - `components/WeightChart.tsx` - Weight chart display
  - `components/WeightView.tsx` - Weight management interface
  - `components/WeightEvolution.tsx` - Weight evolution display
  - `components/WeightProgress.tsx` - Weight progress tracking
- **Features**: Weight charts, evolution display, progress tracking

### 9. **macro-nutrients** - Macro nutrient UI
- **Purpose**: Macro nutrient display and management
- **Key Components**:
  - `components/MacroNutrientsView.tsx` - Macro display
  - `components/MacroTargets.tsx` - Macro targets display
- **Features**: Macro display, target visualization

### 10. **ean** - EAN scanning UI
- **Purpose**: EAN barcode scanning interface
- **Key Components**:
  - `components/EANReader.tsx` - Barcode scanner
  - `components/EANSearch.tsx` - EAN search interface
  - `components/EANInsertModal.tsx` - EAN insertion modal
- **Features**: Barcode scanning, EAN search, food insertion

### 11. **settings** - Application settings UI
- **Purpose**: Application settings and preferences
- **Key Components**:
  - `components/ToastSettings.tsx` - Toast notification settings
  - `components/Toggle.tsx` - Toggle component
- **Features**: Settings management, toast configuration

### 12. **datepicker** - Date picker component
- **Purpose**: Custom date picker implementation
- **Key Components**:
  - `components/Datepicker.tsx` - Main datepicker
  - `components/Calendar/` - Calendar components
  - `contexts/DatepickerContext.ts` - Date picker context
- **Features**: Date selection, calendar display, context management

## Routes Structure

### **routes/** - Page routing
- **Purpose**: SolidJS routing and page components
- **Key Files**:
  - `diet.tsx` - Main diet page
  - `profile.tsx` - Profile page
  - `settings.tsx` - Settings page
  - `index.tsx` - Landing page
  - `api/` - API endpoints
- **Features**: Page routing, API endpoints