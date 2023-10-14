'use client'

import { Recipe } from '@/modules/recipe/domain/recipe'
import { Signal } from '@preact/signals-react'
import { createContext, useContext } from 'use-context-selector'

const RecipeContext = createContext<{ recipe: Signal<Recipe> } | null>(null)

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
  children,
}: {
  recipe: Signal<Recipe>
  children: React.ReactNode
}) {
  return (
    <RecipeContext.Provider
      value={{
        recipe,
      }}
    >
      {children}
    </RecipeContext.Provider>
  )
}
