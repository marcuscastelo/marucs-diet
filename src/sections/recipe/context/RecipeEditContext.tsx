import {
  type Accessor,
  createContext,
  createSignal,
  type JSXElement,
  type Setter,
  untrack,
  useContext,
} from 'solid-js'

import { type Recipe } from '~/modules/diet/recipe/domain/recipe'

export type RecipeContext = {
  recipe: Accessor<Recipe>
  persistentRecipe: Accessor<Recipe>
  setRecipe: Setter<Recipe>
  saveRecipe: () => void
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
  onSaveRecipe: (recipe: Recipe) => void
  children: JSXElement
}) {
  const [persistentRecipe, setPersistentRecipe] = createSignal<Recipe>(
    untrack(() => props.recipe()),
  )

  const handleSaveRecipe = () => {
    const recipe = props.recipe()
    props.onSaveRecipe(recipe)
    setPersistentRecipe(recipe)
  }

  return (
    <recipeContext.Provider
      value={{
        recipe: () => props.recipe(),
        setRecipe: (arg) => props.setRecipe(arg),
        persistentRecipe,
        saveRecipe: handleSaveRecipe,
      }}
    >
      {props.children}
    </recipeContext.Provider>
  )
}
