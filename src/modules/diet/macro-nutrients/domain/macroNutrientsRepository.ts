// MacroNutrientsRepository interface for macro-nutrients domain
export type MacroNutrientsRepository = {
  getById(
    id: number,
  ): Promise<import('./macroNutrients').MacroNutrients | undefined>
  getAll(): Promise<import('./macroNutrients').MacroNutrients[]>
  save(macros: import('./macroNutrients').MacroNutrients): Promise<void>
  delete(id: number): Promise<void>
}
