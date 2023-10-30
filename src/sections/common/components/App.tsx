'use client'

import ConfirmModal from '@/sections/common/components/ConfirmModal'
import { ConfirmModalProvider } from '@/sections/common/context/ConfirmModalContext'

import {
  FoodContextProvider,
  TemplateStore,
} from '@/sections/template/context/TemplateContext'

import { listFoods, searchFoodsByName } from '@/legacy/controllers/food'
import { fetchUserRecentFoods } from '@/legacy/controllers/recentFood'
import { createSupabaseRecipeRepository } from '@/modules/diet/recipe/infrastructure/supabaseRecipeRepository'
import { Template } from '@/modules/diet/template/domain/template'
import { ReactNode, Suspense } from 'react'
import { currentUser } from '@/modules/user/application/user'

export function App({ children }: { children: ReactNode }) {
  console.debug(`[App] - Rendering`)

  return (
    <Suspense>
      <AppConfirmModalProvider>
        <AppFoodsProvider>{children}</AppFoodsProvider>
      </AppConfirmModalProvider>
    </Suspense>
  )
}

function AppConfirmModalProvider({ children }: { children: ReactNode }) {
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
function AppFoodsProvider({ children }: { children: ReactNode }) {
  console.debug(`[AppFoodsProvider] - Rendering`)

  const user = currentUser.value
  if (user === null) {
    throw new Error(`User is null`)
  }

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
