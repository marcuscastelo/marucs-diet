// ItemGroupRepository interface for item-group domain
export type ItemGroupRepository = {
  getById(id: number): Promise<import('./itemGroup').ItemGroup | undefined>
  getAll(): Promise<import('./itemGroup').ItemGroup[]>
  save(group: import('./itemGroup').ItemGroup): Promise<void>
  delete(id: number): Promise<void>
}
