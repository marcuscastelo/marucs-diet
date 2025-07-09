# Other Modules Structure

## Core Modules (Non-Diet)

### 1. **user** - User management
- **Purpose**: User authentication, profile management, and preferences
- **Key Files**:
  - `domain/user.ts` - User entity and validation
  - `application/user.ts` - User state management with SolidJS
  - `infrastructure/supabaseUserRepository.ts` - Database operations
  - `infrastructure/localStorageUserRepository.ts` - Local storage integration
- **Features**: User CRUD, authentication, favorite foods, profile management

### 2. **weight** - Weight tracking
- **Purpose**: Weight measurement tracking and evolution analysis
- **Key Files**:
  - `domain/weight.ts` - Weight entity and schemas
  - `application/weight.ts` - Weight state management
  - `application/weightChartUtils.ts` - Chart data processing
  - `domain/weightEvolutionDomain.ts` - Evolution calculations
  - `infrastructure/supabaseWeightRepository.ts` - Database operations
- **Features**: Weight CRUD, chart generation, moving averages, evolution tracking

### 3. **measure** - Body measurements
- **Purpose**: Body measurement tracking (height, waist, hip, neck, etc.)
- **Key Files**:
  - `domain/measure.ts` - BodyMeasure entity and validation
  - `application/measure.ts` - Measure state management
  - `application/measureUtils.ts` - Calculation utilities
  - `infrastructure/measures.ts` - Database operations
- **Features**: Body measure CRUD, body fat calculation, measurement averages

### 4. **toast** - Notification system
- **Purpose**: Comprehensive toast notification system with queue management
- **Key Files**:
  - `domain/toastTypes.ts` - Toast types and configuration
  - `application/toastManager.ts` - Toast display management
  - `application/toastQueue.ts` - Queue processing
  - `domain/errorMessageHandler.ts` - Error message processing
  - `infrastructure/toastSettings.ts` - Settings management
  - `ui/ExpandableErrorToast.tsx` - Error toast component
- **Features**: Toast queue, error handling, expandable errors, settings

### 5. **search** - Search functionality
- **Purpose**: Search functionality with caching and optimization
- **Key Files**:
  - `application/search.ts` - Search logic
  - `application/cachedSearch.ts` - Cached search implementation
  - `application/searchLogic.ts` - Search algorithms
  - `application/searchCache.ts` - Cache management
- **Features**: Cached search, diacritic-insensitive search, search optimization

### 6. **recent-food** - Recent food tracking
- **Purpose**: Track recently used food items for quick access
- **Key Files**:
  - `domain/recentFood.ts` - RecentFood entity
  - `application/recentFood.ts` - Recent food management
  - `infrastructure/supabaseRecentFoodRepository.ts` - Database operations
- **Features**: Recent food tracking, quick access, persistence

### 7. **profile** - User profile management
- **Purpose**: User profile display and management
- **Key Files**:
  - `application/profile.ts` - Profile state management
- **Features**: Profile data aggregation, user information management

### 8. **theme** - Theme management
- **Purpose**: Application theme configuration
- **Key Files**:
  - `constants.ts` - Theme constants
- **Features**: Theme switching, color schemes

## Shared Utilities

### **shared/** - Cross-cutting concerns
- **Purpose**: Framework-agnostic utilities and shared functionality
- **Key Areas**:
  - `error/` - Error handling utilities
  - `utils/` - Pure utility functions
  - `modal/` - Modal management system
  - `supabase/` - Supabase client and utilities
  - `config/` - Configuration management
  - `domain/` - Shared domain types and validation
  - `hooks/` - Reusable SolidJS hooks
  - `solid/` - SolidJS-specific utilities
- **Features**: Error handling, modal system, utilities, validation