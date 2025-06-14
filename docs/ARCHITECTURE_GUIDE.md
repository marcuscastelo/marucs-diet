# 🧭 SolidJS Frontend Architecture Guide

This guide defines the project's standard architecture to ensure consistency, scalability, and maintainability. Follow the sections below to understand how to structure, name, and build each part of the application.

---

## 📁 Module Structure

All domains should be placed under `src/modules/<name>`, following this structure:

```txt
modules/
  └── <domain>/
      ├── domain/          # Types, entities, and interfaces
      ├── application/     # Resources and orchestration logic
      ├── infrastructure/  # Specific implementations (e.g., Supabase)
      ├── ui/              # UI components
      ├── routes/          # Solid Router entrypoints
      └── tests/           # Module-specific tests
```

---

## ⚙️ General Rules

- ✅ **Strict TypeScript**: `noImplicitAny`, `strictNullChecks`, etc.
- 🚫 **Avoid `any`, `as any`, `@ts-ignore`**, except inside `infrastructure/`.
- ✅ **Follow the layered architecture**:
  - `domain`: Entities, types, interfaces
  - `application`: useCases, SolidJS resources
  - `infrastructure`: Supabase, APIs, DAOs
  - `ui`: Pure presentational components
  - `routes`: Loader + composition
- ✅ Use `cn()` to compose Tailwind classes
- ✅ Use `createResource`, `createSignal`, or `store` as state layer
- 🔁 Avoid complex logic outside `application/`

---

## ✅ Real Example: `day-diet` Module

### `domain/dayDiet.ts`

```ts
export type DayDiet = {
  id: string;
  userId: string;
  date: string;
  totalCalories: number;
};

export const createDayDiet = (data: DayDiet): DayDiet => {
  return data;
};
```

### `domain/dayDietRepository.ts`

```ts
export interface DayDietRepository {
  getDayDietByDate(userId: string, date: string): Promise<DayDiet | null>;
}
```

### `infrastructure/supabaseDayRepository.ts`

```ts
import { DayDietRepository } from "../domain/dayDietRepository";
import { DayDiet } from "../domain/dayDiet";
import { supabase } from "~/lib/supabase";

export const supabaseDayDietRepository: DayDietRepository = {
  async getDayDietByDate(userId, date) {
    const { data, error } = await supabase
      .from("day_diets")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .single();
    if (error) return null;
    return data as DayDiet;
  }
};
```

### `application/dayDiet.ts`

```ts
import { createResource } from "solid-js";
import { supabaseDayDietRepository } from "../infrastructure/supabaseDayRepository";

export const createDayDietResource = (userId: string, date: string) => {
  const [dayDiet] = createResource(() =>
    supabaseDayDietRepository.getDayDietByDate(userId, date)
  );
  return dayDiet;
};
```

### `ui/DayDietCard.tsx`

```tsx
import { Component } from "solid-js";
import { DayDiet } from "../domain/dayDiet";
import { cn } from "~/lib/utils";

export const DayDietCard: Component<{ data: DayDiet }> = (props) => (
  <div class={cn("rounded-xl bg-white shadow p-4")}>
    <p class="text-sm text-gray-500">{props.data.date}</p>
    <p class="text-lg font-bold">{props.data.totalCalories} kcal</p>
  </div>
);
```

### `routes/index.tsx`

```tsx
import { createDayDietResource } from "../application/dayDiet";
import { DayDietCard } from "../ui/DayDietCard";
import { Show } from "solid-js";

export default function DayDietPage() {
  const dayDiet = createDayDietResource("user-id-mock", "2025-06-02");

  return (
    <main>
      <Show when={dayDiet()} fallback={<p>Loading...</p>}>
        {(data) => <DayDietCard data={data()} />}
      </Show>
    </main>
  );
}
```

---

## 🧪 Testing

- Tests must be placed inside the module's `tests/` folder.
- Use `vitest` + `solid-testing-library` for components.
- For domain and application logic, use explicit mocks.

---

## 📚 Conclusion

This architecture allows frontend development to scale cleanly. New modules should follow this structure and conventions to maintain project cohesion.

---

## 📖 See also

For idiomatic code patterns, concrete anti-patterns, and real codebase examples, see [`CODESTYLE_GUIDE.md`](./CODESTYLE_GUIDE.md).

---

## 🚫 Language Policy

All code, comments, documentation, and commit messages must be written strictly in English. The only exception is user-facing UI text, which may be in Portuguese if required by the product. Any other use of Portuguese is strictly prohibited.

---

## 🛑 Error Handling Standard

All domain and application errors must be reported using the shared error handler utility:

- Use `handleApiError` from `~/shared/error/errorHandler` to log, report, or propagate errors.
- Never throw or log errors directly in domain/application code without also calling `handleApiError`.
- Always provide context (component, operation, additionalData) for traceability.

**Example:**
```typescript
import { handleApiError } from '~/shared/error/errorHandler'

if (somethingWentWrong) {
  handleApiError(new Error('Something went wrong'), {
    component: 'itemGroupDomain',
    operation: 'isRecipedGroupUpToDate',
    additionalData: { groupId, groupRecipeId }
  })
  throw new Error('Something went wrong')
}
```

---

## 🧩 Dependency Injection (DI) Pattern

### Overview

The project adopts an explicit, manual Dependency Injection (DI) pattern for all application-layer logic that orchestrates or composes multiple data sources or business rules. This approach increases testability, decouples infrastructure from application logic, and improves maintainability.

### How It Works
- **Dependencies are always passed as arguments** to orchestration functions (e.g., logic, use cases), never imported or instantiated directly inside them.
- **Repositories and fetchers** are created at the application layer and injected into logic functions.
- **No direct infrastructure imports** in logic modules: all dependencies must be provided from the outside.

### Example: Search Module

```ts
// application/searchLogic.ts
export type FetchTemplatesDeps = {
  fetchUserRecipes: (userId: number) => Promise<readonly Recipe[] | null>
  fetchUserRecipeByName: (userId: number, name: string) => Promise<readonly Recipe[] | null>
  fetchUserRecentFoods: (userId: number) => Promise<...>
  fetchFoodById: (id: number) => Promise<Food | null>
  fetchRecipeById: (id: number) => Promise<Recipe | null>
  fetchFoods: (opts: { limit?: number; allowedFoods?: number[] }) => Promise<readonly Food[] | null>
  fetchFoodsByName: (name: string, opts: { limit?: number; allowedFoods?: number[] }) => Promise<readonly Food[] | null>
  getFavoriteFoods: () => number[]
  fetchFoodsByIds: (ids: number[]) => Promise<readonly Food[] | null>
}

export async function fetchTemplatesByTabLogic(
  tabId: string,
  search: string,
  userId: number,
  deps: FetchTemplatesDeps,
): Promise<readonly Template[]> {
  // ...logic using only deps
}
```

```ts
// application/search.ts
import { fetchTemplatesByTabLogic } from './searchLogic'

export const templates = createResource(
  () => ({ tab: debouncedTab(), search: debouncedSearch(), userId: currentUserId() }),
  (signals) => fetchTemplatesByTabLogic(
    signals.tab,
    signals.search,
    signals.userId,
    {
      fetchUserRecipes,
      fetchUserRecipeByName,
      fetchUserRecentFoods,
      fetchFoodById,
      fetchRecipeById,
      fetchFoods,
      fetchFoodsByName,
      getFavoriteFoods,
      fetchFoodsByIds,
    },
  ),
)
```

### Naming Recommendations
- Use `fetchX` for pure data accessors (repositories, fetchers).
- Use `fetchXLogic` (or `getXLogic`, `useXLogic`) for orchestration/composition logic that receives dependencies via arguments.
- Never import infrastructure directly in logic modules.

### Benefits
- **Testability:** All logic can be tested with mocks/stubs.
- **Decoupling:** Application logic is not tied to infrastructure details.
- **Clarity:** Function signatures make dependencies explicit.

---