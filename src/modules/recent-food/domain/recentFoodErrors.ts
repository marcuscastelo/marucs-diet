import { BusinessRuleError, ValidationError } from '~/shared/domain/errors'

/**
 * Error thrown when recent food user ID validation fails
 */
export class RecentFoodInvalidUserIdError extends ValidationError {
  constructor(userId: unknown) {
    super(
      'ID do usuário inválido para alimento recente. Deve ser um número positivo.',
      'RECENT_FOOD_INVALID_USER_ID',
      { userId },
    )
  }
}

/**
 * Error thrown when recent food type validation fails
 */
export class RecentFoodInvalidTypeError extends ValidationError {
  constructor(type: unknown) {
    super(
      `Tipo de alimento recente inválido: '${String(type)}'. Deve ser 'food' ou 'recipe'.`,
      'RECENT_FOOD_INVALID_TYPE',
      { type },
    )
  }
}

/**
 * Error thrown when recent food reference ID validation fails
 */
export class RecentFoodInvalidReferenceIdError extends ValidationError {
  constructor(referenceId: unknown) {
    super(
      'ID de referência inválido para alimento recente. Deve ser um número positivo.',
      'RECENT_FOOD_INVALID_REFERENCE_ID',
      { referenceId },
    )
  }
}

/**
 * Error thrown when recent food last used timestamp validation fails
 */
export class RecentFoodInvalidLastUsedError extends ValidationError {
  constructor(lastUsed: unknown) {
    super(
      'Timestamp de último uso inválido. Deve ser uma data válida.',
      'RECENT_FOOD_INVALID_LAST_USED',
      { lastUsed },
    )
  }
}

/**
 * Error thrown when recent food times used count validation fails
 */
export class RecentFoodInvalidTimesUsedError extends ValidationError {
  constructor(timesUsed: unknown) {
    super(
      'Contador de vezes usado inválido. Deve ser um número não negativo.',
      'RECENT_FOOD_INVALID_TIMES_USED',
      { timesUsed },
    )
  }
}

/**
 * Error thrown when recent food reference does not exist
 */
export class RecentFoodReferenceNotFoundError extends BusinessRuleError {
  constructor(type: string, referenceId: number) {
    super(
      `Referência ${type} com ID ${referenceId} não encontrada.`,
      'RECENT_FOOD_REFERENCE_NOT_FOUND',
      { type, referenceId },
    )
  }
}

/**
 * Error thrown when trying to track too many recent foods for a user
 */
export class RecentFoodLimitExceededError extends BusinessRuleError {
  constructor(currentCount: number, maxLimit: number) {
    super(
      `Limite de alimentos recentes excedido: ${currentCount}/${maxLimit}.`,
      'RECENT_FOOD_LIMIT_EXCEEDED',
      { currentCount, maxLimit },
    )
  }
}

/**
 * Error thrown when recent food last used timestamp is in the future
 */
export class RecentFoodFutureTimestampError extends BusinessRuleError {
  constructor(lastUsed: Date) {
    super(
      `Data de último uso não pode ser no futuro: ${lastUsed.toISOString()}.`,
      'RECENT_FOOD_FUTURE_TIMESTAMP',
      { lastUsed: lastUsed.toISOString() },
    )
  }
}

/**
 * Error thrown when recent food times used count is negative
 */
export class RecentFoodNegativeTimesUsedError extends BusinessRuleError {
  constructor(timesUsed: number) {
    super(
      `Contador de vezes usado não pode ser negativo: ${timesUsed}.`,
      'RECENT_FOOD_NEGATIVE_TIMES_USED',
      { timesUsed },
    )
  }
}

/**
 * Error thrown when recent food tracking frequency is too high
 */
export class RecentFoodTooFrequentUpdateError extends BusinessRuleError {
  constructor(lastUpdate: Date, minInterval: number) {
    super(
      `Atualização muito frequente. Última atualização: ${lastUpdate.toISOString()}. Intervalo mínimo: ${minInterval} segundos.`,
      'RECENT_FOOD_TOO_FREQUENT_UPDATE',
      { lastUpdate: lastUpdate.toISOString(), minInterval },
    )
  }
}
