// RecentFoodRepository interface for recent-food domain
export type RecentFoodRepository = {
  getById(id: number): Promise<import('./recentFood').RecentFood | undefined>
  getAll(): Promise<import('./recentFood').RecentFood[]>
  save(food: import('./recentFood').RecentFood): Promise<void>
  delete(id: number): Promise<void>
}
