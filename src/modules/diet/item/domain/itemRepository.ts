// ItemRepository interface for item domain
export type ItemRepository = {
  getById(id: number): Promise<import('./item').Item | undefined>
  getAll(): Promise<import('./item').Item[]>
  save(item: import('./item').Item): Promise<void>
  delete(id: number): Promise<void>
}
