// TemplateRepository interface for template domain
export type TemplateRepository = {
  getById(id: number): Promise<import('./template').Template | undefined>
  getAll(): Promise<import('./template').Template[]>
  save(template: import('./template').Template): Promise<void>
  delete(id: number): Promise<void>
}
