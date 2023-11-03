import { listFoods, searchFoodsByName } from '@/legacy/controllers/food'
import { fetchUserRecentFoods } from '@/legacy/controllers/recentFood'
import { targetDay } from '@/modules/diet/day-diet/application/dayDiet'
import { createSupabaseRecipeRepository } from '@/modules/diet/recipe/infrastructure/supabaseRecipeRepository'
import { type Template } from '@/modules/diet/template/domain/template'
import { currentUser } from '@/modules/user/application/user'
import { BottomNavigation } from '@/sections/common/components/BottomNavigation'
import { ConfirmModal } from '@/sections/common/components/ConfirmModal'
import { ConfirmModalProvider } from '@/sections/common/context/ConfirmModalContext'
import DayMeals from '@/sections/day-diet/components/DayMeals'
import TopBar from '@/sections/day-diet/components/TopBar'
import { FoodContextProvider, type TemplateStore } from '@/sections/template/context/TemplateContext'
import { type JSXElement } from 'solid-js'

export default function DietPage () {
  return (
    <div class="mx-auto sm:w-3/4 md:w-4/5 lg:w-1/2 xl:w-1/3">
      {/* Top bar with date picker and user icon */}
      <Providers>
        <TopBar selectedDay={targetDay()} />
        <DayMeals selectedDay={targetDay()} />
        <BottomNavigation />
      </Providers>
    </div>
  )
}

/**
 * @deprecated Should be replaced by use cases
 */
function AppFoodsProvider (props: { children: JSXElement }) {
  console.debug('[AppFoodsProvider] - Rendering')

  return (
    <FoodContextProvider
      // eslint-disable-next-line solid/reactivity
      onFetchFoods={async (selectedTypes, search?: string) => {
        console.debug(
          `[FoodContextProvider] onFetchFoods - called with search: ${search}`
        )
        // TODO: Optimize recentFoods fetching: currently, if recentFood is too old (exceeding fetch limit), it will not be fetched and will not be searchable
        console.debug(
          '[FoodContextProvider] onFetchFoods - calling fetchUserRecentFoods'
        )
        const currentUser_ = currentUser()
        if (currentUser_ === null) throw new Error('User not defined')
        const recentFoods = (await fetchUserRecentFoods(currentUser_.id)).map(
          (recentFood) => recentFood.food_id
        )
        console.debug(
          `[FoodContextProvider] onFetchFoods - fetchUserRecentFoods returned: ${JSON.stringify(
            recentFoods,
            null,
            2
          )}
            `
        )

        const { fetchUserRecipes, fetchRecipeByName } =
          createSupabaseRecipeRepository()

        const FETCH_LIMIT = 100
        const fetchFunctions = {
          foods: async (search) =>
            search !== undefined && search !== ''
              ? await searchFoodsByName(search, { limit: FETCH_LIMIT })
              : await listFoods({ limit: FETCH_LIMIT }),
          favoriteFoods: async (search) =>
            search !== undefined && search !== ''
              ? await searchFoodsByName(search, {
                limit: FETCH_LIMIT,
                allowedFoods: currentUser_.favorite_foods
              })
              : await listFoods({
                limit: FETCH_LIMIT,
                allowedFoods: currentUser_.favorite_foods
              }),
          recentFoods: async (search) =>
            search !== undefined && search !== ''
              ? await searchFoodsByName(search, {
                limit: FETCH_LIMIT,
                allowedFoods: recentFoods
              })
              : await listFoods({
                limit: FETCH_LIMIT,
                allowedFoods: recentFoods
              }),
          recipes: async (search) =>
            search !== undefined && search !== ''
              ? await fetchRecipeByName(currentUser_.id, search)
              : await fetchUserRecipes(currentUser_.id)
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
              : null
        } satisfies TemplateStore
      }}
    >
      {props.children}
    </FoodContextProvider>
  )
}

function Providers (props: { children: JSXElement }) {
  return (
    <ConfirmModalProvider>
      <ConfirmModal />
      <AppFoodsProvider>
        {props.children}
      </AppFoodsProvider>
    </ConfirmModalProvider>
  )
}
