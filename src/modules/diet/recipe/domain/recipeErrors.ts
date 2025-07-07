import {
  BusinessRuleError,
  InvariantError,
  ValidationError,
} from '~/shared/domain/errors'

/**
 * Error thrown when recipe name validation fails
 */
export class RecipeInvalidNameError extends ValidationError {
  constructor(name: string) {
    super(
      `Nome da receita inválido: '${name}'. O nome deve ser uma string não vazia.`,
      'RECIPE_INVALID_NAME',
      { name },
    )
  }
}

/**
 * Error thrown when recipe owner validation fails
 */
export class RecipeInvalidOwnerError extends ValidationError {
  constructor(owner: unknown) {
    super(
      'Proprietário da receita inválido. Deve ser um número positivo.',
      'RECIPE_INVALID_OWNER',
      { owner },
    )
  }
}

/**
 * Error thrown when recipe items are invalid
 */
export class RecipeInvalidItemsError extends ValidationError {
  constructor(items: unknown) {
    super(
      'Itens da receita inválidos. Deve ser um array de itens válidos.',
      'RECIPE_INVALID_ITEMS',
      { items },
    )
  }
}

/**
 * Error thrown when recipe prepared multiplier is invalid
 */
export class RecipeInvalidMultiplierError extends ValidationError {
  constructor(multiplier: unknown) {
    super(
      'Multiplicador de preparo inválido. Deve ser um número positivo.',
      'RECIPE_INVALID_MULTIPLIER',
      { multiplier },
    )
  }
}

/**
 * Error thrown when recipe has no items
 */
export class RecipeEmptyItemsError extends BusinessRuleError {
  constructor() {
    super(
      'Receita não pode estar vazia. Adicione pelo menos um item.',
      'RECIPE_EMPTY_ITEMS',
    )
  }
}

/**
 * Error thrown when recipe items have circular dependencies
 */
export class RecipeCircularDependencyError extends InvariantError {
  constructor(recipeId: number, circularPath: number[]) {
    super(
      `Dependência circular detectada na receita ${recipeId}: ${circularPath.join(' -> ')}.`,
      'RECIPE_CIRCULAR_DEPENDENCY',
      { recipeId, circularPath },
    )
  }
}

/**
 * Error thrown when recipe item quantity is invalid
 */
export class RecipeInvalidItemQuantityError extends ValidationError {
  constructor(itemName: string, quantity: number) {
    super(
      `Quantidade inválida para o item '${itemName}': ${quantity}. Deve ser maior que zero.`,
      'RECIPE_INVALID_ITEM_QUANTITY',
      { itemName, quantity },
    )
  }
}

/**
 * Error thrown when recipe multiplier causes overflow
 */
export class RecipeMultiplierOverflowError extends BusinessRuleError {
  constructor(multiplier: number, maxValue: number) {
    super(
      `Multiplicador ${multiplier} causaria overflow. Valor máximo permitido: ${maxValue}.`,
      'RECIPE_MULTIPLIER_OVERFLOW',
      { multiplier, maxValue },
    )
  }
}

/**
 * Error thrown when trying to add invalid item to recipe
 */
export class RecipeInvalidItemReferenceError extends BusinessRuleError {
  constructor(itemReference: unknown, reason: string) {
    super(
      `Referência de item inválida na receita: ${reason}`,
      'RECIPE_INVALID_ITEM_REFERENCE',
      { itemReference, reason },
    )
  }
}
