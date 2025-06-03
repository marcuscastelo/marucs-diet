import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import {
  type Accessor,
  type JSXElement,
  type Setter,
  createContext,
  useContext,
  createSignal,
  createEffect,
} from 'solid-js'

export type RecipeContext = {
  recipe: Accessor<Recipe>
  setRecipe: Setter<Recipe>
}

const recipeContext = createContext<RecipeContext | null>(null)

export function useRecipeEditContext() {
  const context = useContext(recipeContext)

  if (context === null) {
    throw new Error(
      'useRecipeEditContext must be used within a RecipeEditContextProvider',
    )
  }

  return context
}

export function RecipeEditContextProvider(props: {
  recipe: Accessor<Recipe>
  setRecipe: Setter<Recipe>
  children: JSXElement
}) {
  // TODO:   Stop creating a new signal on every context provider
  const [innerRecipe, setInnerRecipe] = createSignal(props.recipe())

  createEffect(() => {
    setInnerRecipe(props.recipe())
  })

  createEffect(() => {
    props.setRecipe(innerRecipe())
  })

  return (
    <recipeContext.Provider
      value={{
        recipe: innerRecipe,
        setRecipe: setInnerRecipe,
      }}
    >
      {props.children}
    </recipeContext.Provider>
  )
}
