import { BusinessRuleError, ValidationError } from '~/shared/domain/errors'

/**
 * Error thrown when weight owner validation fails
 */
export class WeightInvalidOwnerError extends ValidationError {
  constructor(owner: unknown) {
    super(
      'Proprietário do peso inválido. Deve ser um número positivo.',
      'WEIGHT_INVALID_OWNER',
      { owner },
    )
  }
}

/**
 * Error thrown when weight value validation fails
 */
export class WeightInvalidValueError extends ValidationError {
  constructor(weight: unknown) {
    super(
      'Valor do peso inválido. Deve ser um número positivo.',
      'WEIGHT_INVALID_VALUE',
      { weight },
    )
  }
}

/**
 * Error thrown when weight timestamp validation fails
 */
export class WeightInvalidTimestampError extends ValidationError {
  constructor(timestamp: unknown) {
    super(
      'Timestamp do peso inválido. Deve ser uma data válida.',
      'WEIGHT_INVALID_TIMESTAMP',
      { timestamp },
    )
  }
}

/**
 * Error thrown when weight value is unrealistic
 */
export class WeightUnrealisticValueError extends BusinessRuleError {
  constructor(weight: number, minWeight: number, maxWeight: number) {
    super(
      `Peso irrealista: ${weight}kg. Deve estar entre ${minWeight}kg e ${maxWeight}kg.`,
      'WEIGHT_UNREALISTIC_VALUE',
      { weight, minWeight, maxWeight },
    )
  }
}

/**
 * Error thrown when weight timestamp is in the future
 */
export class WeightFutureTimestampError extends BusinessRuleError {
  constructor(timestamp: Date) {
    super(
      `Data do peso não pode ser no futuro: ${timestamp.toISOString()}.`,
      'WEIGHT_FUTURE_TIMESTAMP',
      { timestamp: timestamp.toISOString() },
    )
  }
}

/**
 * Error thrown when weight change is too drastic
 */
export class WeightDrasticChangeError extends BusinessRuleError {
  constructor(
    previousWeight: number,
    newWeight: number,
    maxChange: number,
    daysDiff: number,
  ) {
    const change = Math.abs(newWeight - previousWeight)
    super(
      `Mudança de peso muito drástica: ${change}kg em ${daysDiff} dias. Máximo permitido: ${maxChange}kg.`,
      'WEIGHT_DRASTIC_CHANGE',
      { previousWeight, newWeight, change, daysDiff, maxChange },
    )
  }
}

/**
 * Error thrown when weight measurement frequency is too high
 */
export class WeightTooFrequentMeasurementError extends BusinessRuleError {
  constructor(lastMeasurement: Date, minInterval: number) {
    super(
      `Medição muito frequente. Última medição: ${lastMeasurement.toISOString()}. Intervalo mínimo: ${minInterval} horas.`,
      'WEIGHT_TOO_FREQUENT_MEASUREMENT',
      { lastMeasurement: lastMeasurement.toISOString(), minInterval },
    )
  }
}

/**
 * Error thrown when weight has negative value
 */
export class WeightNegativeValueError extends BusinessRuleError {
  constructor(weight: number) {
    super(`Peso não pode ser negativo: ${weight}kg.`, 'WEIGHT_NEGATIVE_VALUE', {
      weight,
    })
  }
}

/**
 * Error thrown when weight precision is too high
 */
export class WeightExcessivePrecisionError extends BusinessRuleError {
  constructor(weight: number, maxDecimalPlaces: number) {
    super(
      `Precisão do peso excessiva: ${weight}. Máximo de ${maxDecimalPlaces} casas decimais.`,
      'WEIGHT_EXCESSIVE_PRECISION',
      { weight, maxDecimalPlaces },
    )
  }
}
