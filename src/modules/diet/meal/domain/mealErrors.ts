import {
  BusinessRuleError,
  InvariantError,
  ValidationError,
} from '~/shared/domain/errors'

/**
 * Error thrown when meal name validation fails
 */
export class MealInvalidNameError extends ValidationError {
  constructor(name: string) {
    super(
      `Nome da refeição inválido: '${name}'. O nome deve ser uma string não vazia.`,
      'MEAL_INVALID_NAME',
      { name },
    )
  }
}

/**
 * Error thrown when meal items validation fails
 */
export class MealInvalidItemsError extends ValidationError {
  constructor(items: unknown) {
    super(
      'Itens da refeição inválidos. Deve ser um array de itens válidos.',
      'MEAL_INVALID_ITEMS',
      { items },
    )
  }
}

/**
 * Error thrown when meal ID validation fails
 */
export class MealInvalidIdError extends ValidationError {
  constructor(id: unknown) {
    super(
      'ID da refeição inválido. Deve ser um número positivo.',
      'MEAL_INVALID_ID',
      { id },
    )
  }
}

/**
 * Error thrown when meal is empty
 */
export class MealEmptyError extends BusinessRuleError {
  constructor(mealName: string) {
    super(
      `Refeição '${mealName}' não pode estar vazia. Adicione pelo menos um item.`,
      'MEAL_EMPTY',
      { mealName },
    )
  }
}

/**
 * Error thrown when meal has duplicate items
 */
export class MealDuplicateItemsError extends BusinessRuleError {
  constructor(duplicateItemIds: number[]) {
    super(
      `Refeição contém itens duplicados: ${duplicateItemIds.join(', ')}.`,
      'MEAL_DUPLICATE_ITEMS',
      { duplicateItemIds },
    )
  }
}

/**
 * Error thrown when meal exceeds maximum items limit
 */
export class MealMaxItemsExceededError extends BusinessRuleError {
  constructor(currentCount: number, maxLimit: number) {
    super(
      `Número máximo de itens na refeição excedido: ${currentCount}/${maxLimit}.`,
      'MEAL_MAX_ITEMS_EXCEEDED',
      { currentCount, maxLimit },
    )
  }
}

/**
 * Error thrown when meal macros exceed safe limits
 */
export class MealMacroLimitExceededError extends BusinessRuleError {
  constructor(macroType: string, value: number, limit: number) {
    super(
      `Limite de ${macroType} excedido na refeição: ${value}g (limite: ${limit}g).`,
      'MEAL_MACRO_LIMIT_EXCEEDED',
      { macroType, value, limit },
    )
  }
}

/**
 * Error thrown when meal name conflicts with existing meal
 */
export class MealNameConflictError extends BusinessRuleError {
  constructor(name: string, existingMealId: number) {
    super(
      `Já existe uma refeição com o nome '${name}' (ID: ${existingMealId}).`,
      'MEAL_NAME_CONFLICT',
      { name, existingMealId },
    )
  }
}

/**
 * Error thrown when meal has inconsistent state
 */
export class MealInconsistentStateError extends InvariantError {
  constructor(mealId: number, description: string) {
    super(
      `Estado inconsistente da refeição ${mealId}: ${description}`,
      'MEAL_INCONSISTENT_STATE',
      { mealId, description },
    )
  }
}

/**
 * Error thrown when trying to add invalid item to meal
 */
export class MealInvalidItemReferenceError extends BusinessRuleError {
  constructor(itemReference: unknown, reason: string) {
    super(
      `Referência de item inválida na refeição: ${reason}`,
      'MEAL_INVALID_ITEM_REFERENCE',
      { itemReference, reason },
    )
  }
}

/**
 * Error thrown when meal timing is invalid
 */
export class MealInvalidTimingError extends BusinessRuleError {
  constructor(mealName: string, timeSlot: string, reason: string) {
    super(
      `Horário inválido para refeição '${mealName}' no período '${timeSlot}': ${reason}`,
      'MEAL_INVALID_TIMING',
      { mealName, timeSlot, reason },
    )
  }
}

/**
 * Error thrown when meal portions are inconsistent
 */
export class MealInconsistentPortionsError extends BusinessRuleError {
  constructor(mealId: number, totalPortion: number, itemPortions: number[]) {
    super(
      `Porções inconsistentes na refeição ${mealId}. Total: ${totalPortion}, Itens: ${itemPortions.join(', ')}`,
      'MEAL_INCONSISTENT_PORTIONS',
      { mealId, totalPortion, itemPortions },
    )
  }
}
