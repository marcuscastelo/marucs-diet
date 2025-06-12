// MealRepository interface for meal domain
export type MealRepository = {
  getById(id: number): Promise<import('./meal').Meal | undefined>
  getAll(): Promise<import('./meal').Meal[]>
  save(meal: import('./meal').Meal): Promise<void>
  delete(id: number): Promise<void>
}
