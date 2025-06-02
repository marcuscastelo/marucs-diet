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