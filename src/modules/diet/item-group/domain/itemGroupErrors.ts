import {
  BusinessRuleError,
  InvariantError,
  ValidationError,
} from '~/shared/domain/errors'

/**
 * Error thrown when item group name validation fails
 */
export class ItemGroupInvalidNameError extends ValidationError {
  constructor(name: string) {
    super(
      `Nome do grupo de itens inválido: '${name}'. O nome deve ser uma string não vazia.`,
      'ITEM_GROUP_INVALID_NAME',
      { name },
    )
  }
}

/**
 * Error thrown when item group items validation fails
 */
export class ItemGroupInvalidItemsError extends ValidationError {
  constructor(items: unknown) {
    super(
      'Itens do grupo inválidos. Deve ser um array de itens válidos.',
      'ITEM_GROUP_INVALID_ITEMS',
      { items },
    )
  }
}

/**
 * Error thrown when item group recipe ID validation fails
 */
export class ItemGroupInvalidRecipeIdError extends ValidationError {
  constructor(recipeId: unknown) {
    super(
      'ID da receita do grupo inválido. Deve ser um número positivo ou null.',
      'ITEM_GROUP_INVALID_RECIPE_ID',
      { recipeId },
    )
  }
}

/**
 * Error thrown when item group is empty
 */
export class ItemGroupEmptyError extends BusinessRuleError {
  constructor() {
    super(
      'Grupo de itens não pode estar vazio. Adicione pelo menos um item.',
      'ITEM_GROUP_EMPTY',
    )
  }
}

/**
 * Error thrown when item group has duplicate items
 */
export class ItemGroupDuplicateItemsError extends BusinessRuleError {
  constructor(duplicateItemIds: number[]) {
    super(
      `Grupo contém itens duplicados: ${duplicateItemIds.join(', ')}.`,
      'ITEM_GROUP_DUPLICATE_ITEMS',
      { duplicateItemIds },
    )
  }
}

/**
 * Error thrown when item group has invalid recipe reference
 */
export class ItemGroupInvalidRecipeReferenceError extends BusinessRuleError {
  constructor(recipeId: number, reason: string) {
    super(
      `Referência de receita inválida ${recipeId}: ${reason}`,
      'ITEM_GROUP_INVALID_RECIPE_REFERENCE',
      { recipeId, reason },
    )
  }
}

/**
 * Error thrown when item group exceeds maximum items limit
 */
export class ItemGroupMaxItemsExceededError extends BusinessRuleError {
  constructor(currentCount: number, maxLimit: number) {
    super(
      `Número máximo de itens no grupo excedido: ${currentCount}/${maxLimit}.`,
      'ITEM_GROUP_MAX_ITEMS_EXCEEDED',
      { currentCount, maxLimit },
    )
  }
}

/**
 * Error thrown when item group has circular recipe dependencies
 */
export class ItemGroupCircularDependencyError extends InvariantError {
  constructor(groupId: number, circularPath: number[]) {
    super(
      `Dependência circular detectada no grupo ${groupId}: ${circularPath.join(' -> ')}.`,
      'ITEM_GROUP_CIRCULAR_DEPENDENCY',
      { groupId, circularPath },
    )
  }
}

/**
 * Error thrown when item group recipe mismatch occurs
 */
export class ItemGroupRecipeMismatchError extends InvariantError {
  constructor(
    groupId: number,
    expectedRecipeId: number,
    actualRecipeId: number,
  ) {
    super(
      `Incompatibilidade de receita no grupo ${groupId}. Esperado: ${expectedRecipeId}, Atual: ${actualRecipeId}.`,
      'ITEM_GROUP_RECIPE_MISMATCH',
      { groupId, expectedRecipeId, actualRecipeId },
    )
  }
}

/**
 * Error thrown when trying to add invalid item to group
 */
export class ItemGroupInvalidItemReferenceError extends BusinessRuleError {
  constructor(itemReference: unknown, reason: string) {
    super(
      `Referência de item inválida no grupo: ${reason}`,
      'ITEM_GROUP_INVALID_ITEM_REFERENCE',
      { itemReference, reason },
    )
  }
}

/**
 * Error thrown when item group quantities are inconsistent
 */
export class ItemGroupInconsistentQuantitiesError extends BusinessRuleError {
  constructor(groupId: number, description: string) {
    super(
      `Quantidades inconsistentes no grupo ${groupId}: ${description}`,
      'ITEM_GROUP_INCONSISTENT_QUANTITIES',
      { groupId, description },
    )
  }
}
