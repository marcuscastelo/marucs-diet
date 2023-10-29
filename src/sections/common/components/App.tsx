'use client'

import ConfirmModal from '@/sections/common/components/ConfirmModal'
import { ConfirmModalProvider } from '@/sections/common/context/ConfirmModalContext'

import {
  FoodContextProvider,
  TemplateStore,
} from '@/sections/template/context/TemplateContext'
import {
  UserContextProvider,
  useUserContext,
} from '@/sections/user/context/UserContext'
import { listFoods, searchFoodsByName } from '@/legacy/controllers/food'
import { fetchUserRecentFoods } from '@/legacy/controllers/recentFood'
import { createSupabaseRecipeRepository } from '@/modules/diet/recipe/infrastructure/supabaseRecipeRepository'
import { Template } from '@/src/modules/diet/template/domain/template'
import { WeightContextProvider } from '@/src/sections/weight/context/WeightContext'
import { createSupabaseDayRepository } from '@/src/modules/diet/day-diet/infrastructure/supabaseDayRepository'
import { MealContextProvider } from '@/src/sections/meal/context/MealContext'
import { createDerivedMealRepository } from '@/src/modules/diet/meal/infrastructure/derivedMealRepository'
import { computed } from '@preact/signals-react'
import { createDerivedItemGroupRepository } from '@/src/modules/diet/item-group/infrastructure/derivedItemGroupRepository'
import { ItemGroupContextProvider } from '@/src/sections/item-group/context/ItemGroupContext'
import { createSupabaseWeightRepository } from '@/src/modules/weight/infrastructure/supabaseWeightRepository'
import { dayDiets } from '@/src/modules/diet/day-diet/application/dayDiet'
import { currentUser, updateUser } from '@/src/modules/user/application/user'

export default function App({ children }: { children: React.ReactNode }) {
  console.debug(`[App] - Rendering`)

  return (
    <AppUserProvider>
      <AppWeightProvider>
        <AppHackyMealProvider>
          <AppHackyItemGroupProvider>
            <AppConfirmModalProvider>
              <AppFoodsProvider>{children}</AppFoodsProvider>
            </AppConfirmModalProvider>
          </AppHackyItemGroupProvider>
        </AppHackyMealProvider>
      </AppWeightProvider>
    </AppUserProvider>
  )
}

// TODO: Stop fetching user on server side and remove this provider
function AppUserProvider({ children }: { children: React.ReactNode }) {
  console.debug(`[AppUserProvider] - Rendering`)

  if (currentUser.value === null) {
    return <div>Usuário não definido</div>
  }

  return (
    <UserContextProvider
      user={currentUser.value}
      onSaveUser={async (user) => {
        await updateUser(user.id, user)
      }}
    >
      {children}
    </UserContextProvider>
  )
}

// TODO: Remove this hacky provider when Meal is an entity in the DB
/**
 * @deprecated Should be replaced by use cases
 */
function AppHackyMealProvider({ children }: { children: React.ReactNode }) {
  console.debug(`[AppHackyMealProvider] - Rendering`)

  const dayRepository = createSupabaseDayRepository()

  const mealRepository = computed(() => {
    return createDerivedMealRepository(dayDiets, dayRepository)
  })

  return (
    <MealContextProvider repository={mealRepository}>
      {children}
    </MealContextProvider>
  )
}

// TODO: Remove this hacky provider when ItemGroup is an entity in the DB
/**
 * @deprecated Should be replaced by use cases
 */
function AppHackyItemGroupProvider({
  children,
}: {
  children: React.ReactNode
}) {
  console.debug(`[AppHackyItemGroupProvider] - Rendering`)

  const dayRepository = createSupabaseDayRepository()
  const mealRepository = computed(() => {
    return createDerivedMealRepository(dayDiets, dayRepository)
  })

  const itemGroupRepository = computed(() => {
    if (mealRepository.value === null) {
      return null
    }

    return createDerivedItemGroupRepository(dayDiets, mealRepository.value)
  })

  return (
    <ItemGroupContextProvider repository={itemGroupRepository}>
      {children}
    </ItemGroupContextProvider>
  )
}

function AppConfirmModalProvider({ children }: { children: React.ReactNode }) {
  console.debug(`[AppConfirmModalProvider] - Rendering`)

  return (
    <ConfirmModalProvider>
      <ConfirmModal />
      {children}
    </ConfirmModalProvider>
  )
}

/**
 * @deprecated Should be replaced by use cases
 */
function AppFoodsProvider({ children }: { children: React.ReactNode }) {
  console.debug(`[AppFoodsProvider] - Rendering`)

  const { user } = useUserContext()

  return (
    <FoodContextProvider
      onFetchFoods={async (selectedTypes, search?: string) => {
        console.debug(
          `[FoodContextProvider] onFetchFoods - called with search: ${search}`,
        )
        // TODO: Optimize recentFoods fetching: currently, if recentFood is too old (exceeding fetch limit), it will not be fetched and will not be searchable
        console.debug(
          `[FoodContextProvider] onFetchFoods - calling fetchUserRecentFoods`,
        )
        const recentFoods = (await fetchUserRecentFoods(user.id)).map(
          (recentFood) => recentFood.food_id,
        )
        console.debug(
          `[FoodContextProvider] onFetchFoods - fetchUserRecentFoods returned: ${JSON.stringify(
            recentFoods,
            null,
            2,
          )}
            `,
        )

        const { fetchUserRecipes, fetchRecipeByName } =
          createSupabaseRecipeRepository()

        const FETCH_LIMIT = 100
        const fetchFunctions = {
          foods: (search) =>
            search
              ? searchFoodsByName(search, { limit: FETCH_LIMIT })
              : listFoods({ limit: FETCH_LIMIT }),
          favoriteFoods: (search) =>
            search
              ? searchFoodsByName(search, {
                  limit: FETCH_LIMIT,
                  allowedFoods: user.favorite_foods,
                })
              : listFoods({
                  limit: FETCH_LIMIT,
                  allowedFoods: user.favorite_foods,
                }),
          recentFoods: (search) =>
            search
              ? searchFoodsByName(search, {
                  limit: FETCH_LIMIT,
                  allowedFoods: recentFoods,
                })
              : listFoods({
                  limit: FETCH_LIMIT,
                  allowedFoods: recentFoods,
                }),
          recipes: (search) =>
            search
              ? fetchRecipeByName(user.id, search)
              : fetchUserRecipes(user.id),
        } satisfies {
          [key in keyof TemplateStore]: (
            search: string | undefined,
          ) => Promise<readonly Template[]>
        }

        return {
          favoriteFoods:
            selectedTypes === 'all' || selectedTypes.includes('favoriteFoods')
              ? await fetchFunctions.favoriteFoods(search)
              : null,
          foods:
            selectedTypes === 'all' || selectedTypes.includes('foods')
              ? await fetchFunctions.foods(search)
              : null,
          recentFoods:
            selectedTypes === 'all' || selectedTypes.includes('recentFoods')
              ? await fetchFunctions.recentFoods(search)
              : null,
          recipes:
            selectedTypes === 'all' || selectedTypes.includes('recipes')
              ? await fetchFunctions.recipes(search)
              : null,
        } satisfies TemplateStore
      }}
    >
      {children}
    </FoodContextProvider>
  )
}

/**
 * @deprecated Should be replaced by use cases
 */
function AppWeightProvider({ children }: { children: React.ReactNode }) {
  console.debug(`[AppWeightProvider] - Rendering`)

  const repository = createSupabaseWeightRepository()

  return (
    <WeightContextProvider repository={repository}>
      {children}
    </WeightContextProvider>
  )
}
