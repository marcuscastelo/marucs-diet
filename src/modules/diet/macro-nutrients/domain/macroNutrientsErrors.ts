import { BusinessRuleError, ValidationError } from '~/shared/domain/errors'

/**
 * Error thrown when macro nutrients validation fails
 */
export class MacroNutrientsInvalidError extends ValidationError {
  constructor(macros: unknown) {
    super(
      'Macronutrientes inválidos. Carbs, protein e fat devem ser números.',
      'MACRO_NUTRIENTS_INVALID',
      { macros },
    )
  }
}

/**
 * Error thrown when macro nutrients have negative values
 */
export class MacroNutrientsNegativeValuesError extends ValidationError {
  constructor(negativeFields: Record<string, number>) {
    super(
      'Macronutrientes não podem ter valores negativos.',
      'MACRO_NUTRIENTS_NEGATIVE_VALUES',
      { negativeFields },
    )
  }
}

/**
 * Error thrown when macro nutrients carbs value is invalid
 */
export class MacroNutrientsInvalidCarbsError extends ValidationError {
  constructor(carbs: unknown) {
    super(
      `Valor de carboidratos inválido: ${String(carbs)}. Deve ser um número não negativo.`,
      'MACRO_NUTRIENTS_INVALID_CARBS',
      { carbs },
    )
  }
}

/**
 * Error thrown when macro nutrients protein value is invalid
 */
export class MacroNutrientsInvalidProteinError extends ValidationError {
  constructor(protein: unknown) {
    super(
      `Valor de proteína inválido: ${String(protein)}. Deve ser um número não negativo.`,
      'MACRO_NUTRIENTS_INVALID_PROTEIN',
      { protein },
    )
  }
}

/**
 * Error thrown when macro nutrients fat value is invalid
 */
export class MacroNutrientsInvalidFatError extends ValidationError {
  constructor(fat: unknown) {
    super(
      `Valor de gordura inválido: ${String(fat)}. Deve ser um número não negativo.`,
      'MACRO_NUTRIENTS_INVALID_FAT',
      { fat },
    )
  }
}

/**
 * Error thrown when macro nutrients ratios are unrealistic
 */
export class MacroNutrientsUnrealisticRatiosError extends BusinessRuleError {
  constructor(carbs: number, protein: number, fat: number, reason: string) {
    super(
      `Proporções irrealistas de macronutrientes: C:${carbs}g P:${protein}g F:${fat}g. ${reason}`,
      'MACRO_NUTRIENTS_UNREALISTIC_RATIOS',
      { carbs, protein, fat, reason },
    )
  }
}

/**
 * Error thrown when macro nutrients exceed maximum safe values
 */
export class MacroNutrientsExcessiveValuesError extends BusinessRuleError {
  constructor(macro: string, value: number, maxSafe: number, context?: string) {
    const contextStr =
      context !== undefined && context !== '' ? ` - ${context}` : ''
    super(
      `Valor excessivo de ${macro}: ${value}g (máximo seguro: ${maxSafe}g)${contextStr}.`,
      'MACRO_NUTRIENTS_EXCESSIVE_VALUES',
      { macro, value, maxSafe, context },
    )
  }
}

/**
 * Error thrown when macro nutrients calculation overflows
 */
export class MacroNutrientsCalculationOverflowError extends BusinessRuleError {
  constructor(operation: string, operands: number[], result: number) {
    super(
      `Overflow em cálculo de macronutrientes: ${operation} com ${operands.join(', ')} resultou em ${result}`,
      'MACRO_NUTRIENTS_CALCULATION_OVERFLOW',
      { operation, operands, result },
    )
  }
}

/**
 * Error thrown when macro nutrients have insufficient total calories
 */
export class MacroNutrientsInsufficientCaloriesError extends BusinessRuleError {
  constructor(totalCalories: number, minRequired: number) {
    super(
      `Calorias insuficientes: ${totalCalories}kcal (mínimo: ${minRequired}kcal).`,
      'MACRO_NUTRIENTS_INSUFFICIENT_CALORIES',
      { totalCalories, minRequired },
    )
  }
}

/**
 * Error thrown when macro nutrients precision is excessive
 */
export class MacroNutrientsExcessivePrecisionError extends BusinessRuleError {
  constructor(macro: string, value: number, maxDecimalPlaces: number) {
    super(
      `Precisão excessiva para ${macro}: ${value}. Máximo de ${maxDecimalPlaces} casas decimais.`,
      'MACRO_NUTRIENTS_EXCESSIVE_PRECISION',
      { macro, value, maxDecimalPlaces },
    )
  }
}
