'use client'

import { Recipe } from '@/model/recipeModel'
import { createContext, useContext } from 'use-context-selector'

const RecipeContext = createContext<{ recipe: Recipe } | null>(null)

export function useRecipeContext() {
  const context = useContext(RecipeContext)

  if (!context) {
    throw new Error(
      'useRecipeContext must be used within a RecipeContextProvider',
    )
  }

  return context
}

export function RecipeContextProvider({
  recipe,
  children,
}: {
  recipe: Recipe
  children: React.ReactNode
}) {
  return (
    <RecipeContext.Provider value={{ recipe }}>
      {children}
    </RecipeContext.Provider>
  )
}
