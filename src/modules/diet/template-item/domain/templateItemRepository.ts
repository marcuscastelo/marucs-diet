// TemplateItemRepository interface for template-item domain
export type TemplateItemRepository = {
  getById(
    id: number,
  ): Promise<import('./templateItem').TemplateItem | undefined>
  getAll(): Promise<import('./templateItem').TemplateItem[]>
  save(item: import('./templateItem').TemplateItem): Promise<void>
  delete(id: number): Promise<void>
}
