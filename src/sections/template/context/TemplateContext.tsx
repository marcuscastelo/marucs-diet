import { type Food } from '@/modules/diet/food/domain/food'
import { type Recipe } from '@/modules/diet/recipe/domain/recipe'
import {
  type Loadable
} from '@/legacy/utils/loadable'
import { type JSXElement, createContext, createSignal, useContext, onMount, type Accessor } from 'solid-js'

// TODO: Banish TemplateContext! Use cases should be used instead
export type TemplateStore = {
  foods: readonly Food[] | null
  favoriteFoods: readonly Food[] | null
  recentFoods: readonly Food[] | null
  recipes: readonly Recipe[] | null
}

type FoodFetch = (
  selectedTypes: 'all' | ReadonlyArray<keyof TemplateStore>,
  search?: string,
) => Promise<TemplateStore>

export type FoodContext = {
  foods: Accessor<Loadable<readonly Food[]>>
  favoriteFoods: Accessor<Loadable<readonly Food[]>>
  recentFoods: Accessor<Loadable<readonly Food[]>>
  recipes: Accessor<Loadable<readonly Recipe[]>>
  refetchFoods: (...params: Parameters<FoodFetch>) => void
}

const foodContext = createContext<FoodContext | null>(null)

export function useFoodContext () {
  const context = useContext(foodContext)

  if (context === null) {
    throw new Error('useFoodContext must be used within a FoodContextProvider')
  }

  return context
}

export function FoodContextProvider (props: {
  onFetchFoods: FoodFetch
  children: JSXElement
}) {
  const [foodStore, setFoodStore] = createSignal<Loadable<TemplateStore>>({
    loading: true
  })

  const handleFetchFoods =
    (selectedTypes: 'all' | ReadonlyArray<keyof TemplateStore>, search?: string | undefined) => {
      props.onFetchFoods(selectedTypes, search)
        .then((newFoodStore) => {
          setFoodStore({
            loading: false,
            errored: false,
            data: newFoodStore
          })
        })
        .catch((error) => {
          setFoodStore({ loading: false, errored: true, error })
        })
    }

  onMount(() => {
    handleFetchFoods('all')
  })

  const makeLoadableInnerAccessor = <T extends keyof TemplateStore>(field: T) => (): Loadable<NonNullable<TemplateStore[T]>> => {
    const foodStore_ = foodStore()

    if (foodStore_.loading) {
      return foodStore_
    }

    if (foodStore_.errored) {
      return foodStore_
    }

    const fieldValue = foodStore_.data[field]
    if (fieldValue === null) {
      throw new Error('foodStore.data is null')
    }

    return { loading: false, errored: false, data: fieldValue }
  }

  const context: FoodContext = {
    foods: makeLoadableInnerAccessor('foods'),
    favoriteFoods: makeLoadableInnerAccessor('favoriteFoods'),
    recentFoods: makeLoadableInnerAccessor('recentFoods'),
    recipes: makeLoadableInnerAccessor('recipes'),
    refetchFoods: handleFetchFoods
  }

  return <foodContext.Provider value={context}>{props.children}</foodContext.Provider>
}
