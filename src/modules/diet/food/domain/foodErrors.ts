import { BusinessRuleError, ValidationError } from '~/shared/domain/errors'

/**
 * Error thrown when food name validation fails
 */
export class FoodInvalidNameError extends ValidationError {
  constructor(name: string) {
    super(
      `Nome do alimento inválido: '${name}'. O nome deve ser uma string não vazia.`,
      'FOOD_INVALID_NAME',
      { name },
    )
  }
}

/**
 * Error thrown when food macro nutrients are invalid
 */
export class FoodInvalidMacrosError extends ValidationError {
  constructor(macros: unknown) {
    super(
      'Macronutrientes do alimento inválidos. Valores devem ser números não negativos.',
      'FOOD_INVALID_MACROS',
      { macros },
    )
  }
}

/**
 * Error thrown when food EAN code format is invalid
 */
export class FoodInvalidEanError extends ValidationError {
  constructor(ean: string) {
    super(
      `Código EAN inválido: '${ean}'. Deve seguir o formato padrão.`,
      'FOOD_INVALID_EAN',
      { ean },
    )
  }
}

/**
 * Error thrown when food source information is invalid
 */
export class FoodInvalidSourceError extends ValidationError {
  constructor(source: unknown) {
    super(
      'Fonte do alimento inválida. Deve conter tipo e identificador válidos.',
      'FOOD_INVALID_SOURCE',
      { source },
    )
  }
}

/**
 * Error thrown when trying to promote a food without proper data
 */
export class FoodPromotionError extends BusinessRuleError {
  constructor(foodData: unknown, reason: string) {
    super(`Erro ao promover alimento: ${reason}`, 'FOOD_PROMOTION_ERROR', {
      foodData,
      reason,
    })
  }
}

/**
 * Error thrown when food macros have negative values
 */
export class FoodNegativeMacrosError extends BusinessRuleError {
  constructor(macros: Record<string, number>) {
    super(
      'Macronutrientes não podem ter valores negativos.',
      'FOOD_NEGATIVE_MACROS',
      { macros },
    )
  }
}

/**
 * Error thrown when food contains duplicate EAN in same context
 */
export class FoodDuplicateEanError extends BusinessRuleError {
  constructor(ean: string) {
    super(`Alimento com código EAN '${ean}' já existe.`, 'FOOD_DUPLICATE_EAN', {
      ean,
    })
  }
}
