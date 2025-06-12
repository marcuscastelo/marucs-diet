// RecipeItemRepository interface for recipe-item domain
export type RecipeItemRepository = {
  getById(id: number): Promise<import('./recipeItem').RecipeItem | undefined>
  getAll(): Promise<import('./recipeItem').RecipeItem[]>
  save(item: import('./recipeItem').RecipeItem): Promise<void>
  delete(id: number): Promise<void>
}
