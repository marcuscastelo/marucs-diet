import { BusinessRuleError, ValidationError } from '~/shared/domain/errors'

/**
 * Error thrown when macro profile owner validation fails
 */
export class MacroProfileInvalidOwnerError extends ValidationError {
  constructor(owner: unknown) {
    super(
      'Proprietário do perfil de macros inválido. Deve ser um número positivo.',
      'MACRO_PROFILE_INVALID_OWNER',
      { owner },
    )
  }
}

/**
 * Error thrown when macro profile target day validation fails
 */
export class MacroProfileInvalidTargetDayError extends ValidationError {
  constructor(targetDay: unknown) {
    super(
      'Data alvo do perfil de macros inválida. Deve ser uma data válida.',
      'MACRO_PROFILE_INVALID_TARGET_DAY',
      { targetDay },
    )
  }
}

/**
 * Error thrown when macro profile grams per kg values are invalid
 */
export class MacroProfileInvalidGramsPerKgError extends ValidationError {
  constructor(macro: string, value: unknown) {
    super(
      `Valor de gramas por kg inválido para ${macro}: ${String(value)}. Deve ser um número positivo.`,
      'MACRO_PROFILE_INVALID_GRAMS_PER_KG',
      { macro, value },
    )
  }
}

/**
 * Error thrown when macro profile has negative values
 */
export class MacroProfileNegativeValuesError extends ValidationError {
  constructor(negativeFields: Record<string, number>) {
    super(
      'Perfil de macros não pode ter valores negativos.',
      'MACRO_PROFILE_NEGATIVE_VALUES',
      { negativeFields },
    )
  }
}

/**
 * Error thrown when macro profile values are unrealistic/dangerous
 */
export class MacroProfileUnrealisticValuesError extends BusinessRuleError {
  constructor(field: string, value: number, maxSafe: number) {
    super(
      `Valor de ${field} (${value}g/kg) excede o limite seguro (${maxSafe}g/kg).`,
      'MACRO_PROFILE_UNREALISTIC_VALUES',
      { field, value, maxSafe },
    )
  }
}

/**
 * Error thrown when macro profile conflicts with existing profile for same date
 */
export class MacroProfileDateConflictError extends BusinessRuleError {
  constructor(targetDay: string, existingProfileId: number) {
    super(
      `Já existe um perfil de macros para o dia ${targetDay} (ID: ${existingProfileId}).`,
      'MACRO_PROFILE_DATE_CONFLICT',
      { targetDay, existingProfileId },
    )
  }
}

/**
 * Error thrown when macro profile has insufficient total macros
 */
export class MacroProfileInsufficientMacrosError extends BusinessRuleError {
  constructor(totalGramsPerKg: number, minRequired: number) {
    super(
      `Total de macros insuficiente: ${totalGramsPerKg}g/kg (mínimo: ${minRequired}g/kg).`,
      'MACRO_PROFILE_INSUFFICIENT_MACROS',
      { totalGramsPerKg, minRequired },
    )
  }
}

/**
 * Error thrown when macro profile calculation results in overflow
 */
export class MacroProfileCalculationOverflowError extends BusinessRuleError {
  constructor(calculation: string, result: number) {
    super(
      `Cálculo do perfil de macros causou overflow em ${calculation}: ${result}`,
      'MACRO_PROFILE_CALCULATION_OVERFLOW',
      { calculation, result },
    )
  }
}
