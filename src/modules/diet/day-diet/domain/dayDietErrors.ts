import {
  BusinessRuleError,
  InvariantError,
  ValidationError,
} from '~/shared/domain/errors'

/**
 * Error thrown when day diet target day validation fails
 */
export class DayDietInvalidTargetDayError extends ValidationError {
  constructor(targetDay: unknown) {
    super(
      'Data alvo da dieta inválida. Deve ser uma string no formato YYYY-MM-DD.',
      'DAY_DIET_INVALID_TARGET_DAY',
      { targetDay },
    )
  }
}

/**
 * Error thrown when day diet owner validation fails
 */
export class DayDietInvalidOwnerError extends ValidationError {
  constructor(owner: unknown) {
    super(
      'Proprietário da dieta diária inválido. Deve ser um número positivo.',
      'DAY_DIET_INVALID_OWNER',
      { owner },
    )
  }
}

/**
 * Error thrown when day diet meals are invalid
 */
export class DayDietInvalidMealsError extends ValidationError {
  constructor(meals: unknown) {
    super(
      'Refeições da dieta diária inválidas. Deve ser um array de refeições.',
      'DAY_DIET_INVALID_MEALS',
      { meals },
    )
  }
}

/**
 * Error thrown when trying to add meal with duplicate ID
 */
export class DayDietDuplicateMealError extends BusinessRuleError {
  constructor(mealId: number) {
    super(
      `Refeição com ID ${mealId} já existe na dieta do dia.`,
      'DAY_DIET_DUPLICATE_MEAL',
      { mealId },
    )
  }
}

/**
 * Error thrown when meal is not found in day diet
 */
export class DayDietMealNotFoundError extends BusinessRuleError {
  constructor(mealId: number) {
    super(
      `Refeição com ID ${mealId} não encontrada na dieta do dia.`,
      'DAY_DIET_MEAL_NOT_FOUND',
      { mealId },
    )
  }
}

/**
 * Error thrown when day diet exceeds maximum meal limit
 */
export class DayDietMaxMealsExceededError extends BusinessRuleError {
  constructor(currentCount: number, maxLimit: number) {
    super(
      `Número máximo de refeições excedido. Atual: ${currentCount}, Máximo: ${maxLimit}.`,
      'DAY_DIET_MAX_MEALS_EXCEEDED',
      { currentCount, maxLimit },
    )
  }
}

/**
 * Error thrown when day diet has inconsistent state
 */
export class DayDietInconsistentStateError extends InvariantError {
  constructor(description: string) {
    super(
      `Estado inconsistente da dieta diária: ${description}`,
      'DAY_DIET_INCONSISTENT_STATE',
      { description },
    )
  }
}

/**
 * Error thrown when day diet macros exceed safe limits
 */
export class DayDietMacroLimitExceededError extends BusinessRuleError {
  constructor(macroType: string, value: number, limit: number) {
    super(
      `Limite de ${macroType} excedido: ${value}g (limite: ${limit}g).`,
      'DAY_DIET_MACRO_LIMIT_EXCEEDED',
      { macroType, value, limit },
    )
  }
}

/**
 * Error thrown when day diet target date conflicts with existing diet
 */
export class DayDietDateConflictError extends BusinessRuleError {
  constructor(targetDay: string, existingDietId: number) {
    super(
      `Já existe uma dieta para o dia ${targetDay} (ID: ${existingDietId}).`,
      'DAY_DIET_DATE_CONFLICT',
      { targetDay, existingDietId },
    )
  }
}
