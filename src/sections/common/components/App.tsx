'use client'

import ConfirmModal from '@/sections/common/components/ConfirmModal'
import { ConfirmModalProvider } from '@/sections/common/context/ConfirmModalContext'
import { DaysContextProvider } from '@/sections/day/context/DaysContext'
import {
  FoodContextProvider,
  TemplateStore,
} from '@/sections/template/context/TemplateContext'
import {
  UserContextProvider,
  useUserContext,
  useUserId,
} from '@/sections/user/context/UserContext'
import { listDays } from '@/legacy/controllers/days'
import { listFoods, searchFoodsByName } from '@/legacy/controllers/food'
import { fetchUserRecentFoods } from '@/legacy/controllers/recentFood'
import { listRecipes, searchRecipeByName } from '@/legacy/controllers/recipes'
import { updateUser } from '@/legacy/controllers/users'
import { Template } from '@/modules/template/domain/template'
import { User } from '@/modules/user/domain/user'

export default function App({
  user,
  onSaveUser,
  children,
}: {
  user: User
  onSaveUser: () => void
  children: React.ReactNode
}) {
  return (
    <AppUserProvider user={user} onSaveUser={onSaveUser}>
      <AppDaysProvider>
        <AppConfirmModalProvider>
          <AppFoodsProvider>{children}</AppFoodsProvider>
        </AppConfirmModalProvider>
      </AppDaysProvider>
    </AppUserProvider>
  )
}

function AppUserProvider({
  user,
  onSaveUser,
  children,
}: {
  user: User
  onSaveUser: () => void
  children: React.ReactNode
}) {
  console.debug(`[AppUserProvider] - Rendering`)
  return (
    <UserContextProvider
      user={user}
      onSaveUser={async (user) => {
        await updateUser(user.id, user)
        onSaveUser()
      }}
    >
      {children}
    </UserContextProvider>
  )
}

function AppDaysProvider({ children }: { children: React.ReactNode }) {
  console.debug(`[AppDaysProvider] - Rendering`)

  const userId = useUserId()

  if (!userId) {
    return <div>UserId is undefined</div>
  }

  return (
    <DaysContextProvider
      userId={userId}
      onFetchDays={async () => {
        return await listDays(userId)
      }}
    >
      {children}
    </DaysContextProvider>
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
            search ? searchRecipeByName(user.id, search) : listRecipes(user.id),
        } satisfies {
          [key in keyof TemplateStore]: (
            search: string | undefined,
          ) => Promise<Template[]>
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
