import DietPage from '@/app/DietPage'
import { ProfilePage } from '@/app/ProfilePage'
import { listFoods, searchFoodsByName } from '@/legacy/controllers/food'
import { fetchUserRecentFoods } from '@/legacy/controllers/recentFood'
import { createSupabaseRecipeRepository } from '@/modules/diet/recipe/infrastructure/supabaseRecipeRepository'
import { type Template } from '@/modules/diet/template/domain/template'
import { currentUser } from '@/modules/user/application/user'
import { ConfirmModal } from '@/sections/common/components/ConfirmModal'
import { ConfirmModalProvider } from '@/sections/common/context/ConfirmModalContext'
import { FoodContextProvider, type TemplateStore } from '@/sections/template/context/TemplateContext'
import { Route, Routes } from '@solidjs/router'
import { type JSXElement } from 'solid-js'

export default function App () {
  return (
    <Providers>

    <Routes>
      <Route path="/" component={DietPage} />
      <Route path="/profile" component={ProfilePage} />
    </Routes>
    </Providers>

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
          '[FoodContextProvider] onFetchFoods - calsling fetchUserRecentFoods'
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
