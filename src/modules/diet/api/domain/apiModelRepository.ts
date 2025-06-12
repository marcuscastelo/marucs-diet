// ApiModelRepository type for api domain
// TODO: Replace 'object' with the correct type when available
export type ApiModelRepository = {
  getById(id: number): Promise<object | undefined>
  getAll(): Promise<object[]>
  save(model: object): Promise<void>
  delete(id: number): Promise<void>
}
