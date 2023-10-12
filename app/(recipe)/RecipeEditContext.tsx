'use client'

import { Recipe } from '@/model/recipeModel'
import { State } from '@/utils/typeUtils'
import { Dispatch, SetStateAction } from 'react'
import { createContext, useContext } from 'use-context-selector'

const RecipeContext = createContext<{ recipe: State<Recipe> } | null>(null)

export function useRecipeEditContext() {
  const context = useContext(RecipeContext)

  if (!context) {
    throw new Error(
      'useRecipeContext must be used within a RecipeContextProvider',
    )
  }

  return context
}

export function RecipeEditContextProvider({
  recipe,
  setRecipe,
  children,
}: {
  recipe: Recipe
  setRecipe: Dispatch<SetStateAction<Recipe>>
  children: React.ReactNode
}) {
  return (
    <RecipeContext.Provider
      value={{
        recipe: {
          value: recipe,
          setValue: setRecipe,
        },
      }}
    >
      {children}
    </RecipeContext.Provider>
  )
}
