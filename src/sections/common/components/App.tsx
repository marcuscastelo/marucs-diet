'use client'

import { currentUser, updateUser } from '@/src/modules/user/application/user'
import { UserContextProvider } from '@/src/sections/user/context/UserContext'
import { useEffect } from 'react'

export default function App({ children }: { children: React.ReactNode }) {
  console.debug(`[App] - Rendering`)

  return (
    <AppUserProvider>
      {children}
      {/* <AppWeightProvider>
        <AppDayProvider>
          <AppHackyMealProvider>
            <AppHackyItemGroupProvider>
              <AppConfirmModalProvider>
                <AppFoodsProvider> </AppFoodsProvider>
              </AppConfirmModalProvider>
            </AppHackyItemGroupProvider>
          </AppHackyMealProvider>
        </AppDayProvider>
      </AppWeightProvider> */}
    </AppUserProvider>
  )
}

// TODO: Stop fetching user on server side and remove this provider
function AppUserProvider({ children }: { children: React.ReactNode }) {
  console.debug(`[AppUserProvider] - Rendering`)

  useEffect(() => {
    // initializeUser()
  }, [])

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

// /**
//  * @deprecated Should be replaced by use cases
//  */
// function AppDayProvider({ children }: { children: React.ReactNode }) {
//   console.debug(`[AppDaysProvider] - Rendering`)

//   const userId = useUserId()

//   if (!userId) {
//     return <div>UserId is undefined</div>
//   }

//   const dayRepository = createSupabaseDayRepository()

//   return (
//     <DayContextProvider userId={userId} repository={dayRepository}>
//       {children}
//     </DayContextProvider>
//   )
// }

// // TODO: Remove this hacky provider when Meal is an entity in the DB
// /**
//  * @deprecated Should be replaced by use cases
//  */
// function AppHackyMealProvider({ children }: { children: React.ReactNode }) {
//   console.debug(`[AppHackyMealProvider] - Rendering`)

//   const { days } = useDayContext()
//   const dayRepository = createSupabaseDayRepository()

//   const mealRepository = computed(() => {
//     if (days.value.loading || days.value.errored) {
//       return null
//     }
//     return createDerivedMealRepository(days.value.data, dayRepository)
//   })

//   return (
//     <MealContextProvider repository={mealRepository}>
//       {children}
//     </MealContextProvider>
//   )
// }

// // TODO: Remove this hacky provider when ItemGroup is an entity in the DB
// /**
//  * @deprecated Should be replaced by use cases
//  */
// function AppHackyItemGroupProvider({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   console.debug(`[AppHackyItemGroupProvider] - Rendering`)

//   const { days } = useDayContext()
//   const dayRepository = createSupabaseDayRepository()
//   const mealRepository = computed(() => {
//     if (days.value.loading || days.value.errored) {
//       return null
//     }
//     return createDerivedMealRepository(days.value.data, dayRepository)
//   })

//   const itemGroupRepository = computed(() => {
//     if (days.value.loading || days.value.errored) {
//       return null
//     }

//     if (mealRepository.value === null) {
//       return null
//     }

//     return createDerivedItemGroupRepository(
//       days.value.data,
//       mealRepository.value,
//     )
//   })

//   return (
//     <ItemGroupContextProvider repository={itemGroupRepository}>
//       {children}
//     </ItemGroupContextProvider>
//   )
// }

// function AppConfirmModalProvider({ children }: { children: React.ReactNode }) {
//   console.debug(`[AppConfirmModalProvider] - Rendering`)

//   return (
//     <ConfirmModalProvider>
//       <ConfirmModal />
//       {children}
//     </ConfirmModalProvider>
//   )
// }

// /**
//  * @deprecated Should be replaced by use cases
//  */
// function AppFoodsProvider({ children }: { children: React.ReactNode }) {
//   console.debug(`[AppFoodsProvider] - Rendering`)

//   const { user } = useUserContext()

//   return (
//     <FoodContextProvider
//       onFetchFoods={async (selectedTypes, search?: string) => {
//         console.debug(
//           `[FoodContextProvider] onFetchFoods - called with search: ${search}`,
//         )
//         // TODO: Optimize recentFoods fetching: currently, if recentFood is too old (exceeding fetch limit), it will not be fetched and will not be searchable
//         console.debug(
//           `[FoodContextProvider] onFetchFoods - calling fetchUserRecentFoods`,
//         )
//         const recentFoods = (await fetchUserRecentFoods(user.id)).map(
//           (recentFood) => recentFood.food_id,
//         )
//         console.debug(
//           `[FoodContextProvider] onFetchFoods - fetchUserRecentFoods returned: ${JSON.stringify(
//             recentFoods,
//             null,
//             2,
//           )}
//             `,
//         )

//         const { fetchUserRecipes, fetchRecipeByName } =
//           createSupabaseRecipeRepository()

//         const FETCH_LIMIT = 100
//         const fetchFunctions = {
//           foods: (search) =>
//             search
//               ? searchFoodsByName(search, { limit: FETCH_LIMIT })
//               : listFoods({ limit: FETCH_LIMIT }),
//           favoriteFoods: (search) =>
//             search
//               ? searchFoodsByName(search, {
//                   limit: FETCH_LIMIT,
//                   allowedFoods: user.favorite_foods,
//                 })
//               : listFoods({
//                   limit: FETCH_LIMIT,
//                   allowedFoods: user.favorite_foods,
//                 }),
//           recentFoods: (search) =>
//             search
//               ? searchFoodsByName(search, {
//                   limit: FETCH_LIMIT,
//                   allowedFoods: recentFoods,
//                 })
//               : listFoods({
//                   limit: FETCH_LIMIT,
//                   allowedFoods: recentFoods,
//                 }),
//           recipes: (search) =>
//             search
//               ? fetchRecipeByName(user.id, search)
//               : fetchUserRecipes(user.id),
//         } satisfies {
//           [key in keyof TemplateStore]: (
//             search: string | undefined,
//           ) => Promise<readonly Template[]>
//         }

//         return {
//           favoriteFoods:
//             selectedTypes === 'all' || selectedTypes.includes('favoriteFoods')
//               ? await fetchFunctions.favoriteFoods(search)
//               : null,
//           foods:
//             selectedTypes === 'all' || selectedTypes.includes('foods')
//               ? await fetchFunctions.foods(search)
//               : null,
//           recentFoods:
//             selectedTypes === 'all' || selectedTypes.includes('recentFoods')
//               ? await fetchFunctions.recentFoods(search)
//               : null,
//           recipes:
//             selectedTypes === 'all' || selectedTypes.includes('recipes')
//               ? await fetchFunctions.recipes(search)
//               : null,
//         } satisfies TemplateStore
//       }}
//     >
//       {children}
//     </FoodContextProvider>
//   )
// }

// /**
//  * @deprecated Should be replaced by use cases
//  */
// function AppWeightProvider({ children }: { children: React.ReactNode }) {
//   console.debug(`[AppWeightProvider] - Rendering`)

//   const repository = createSupabaseWeightRepository()

//   return (
//     <WeightContextProvider repository={repository}>
//       {children}
//     </WeightContextProvider>
//   )
// }
