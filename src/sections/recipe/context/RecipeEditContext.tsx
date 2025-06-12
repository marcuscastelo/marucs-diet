import {
  type Accessor,
  createContext,
  type JSXElement,
  type Setter,
  useContext,
} from 'solid-js'

import { type Recipe } from '~/modules/diet/recipe/domain/recipe'

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
  return (
    <recipeContext.Provider
      value={{
        recipe: props.recipe,
        setRecipe: props.setRecipe,
      }}
    >
      {props.children}
    </recipeContext.Provider>
  )
}
