import { BusinessRuleError, ValidationError } from '~/shared/domain/errors'

/**
 * Error thrown when measure owner validation fails
 */
export class MeasureInvalidOwnerError extends ValidationError {
  constructor(owner: unknown) {
    super(
      'Proprietário da medida inválido. Deve ser um número positivo.',
      'MEASURE_INVALID_OWNER',
      { owner },
    )
  }
}

/**
 * Error thrown when measure height validation fails
 */
export class MeasureInvalidHeightError extends ValidationError {
  constructor(height: unknown) {
    super(
      'Altura inválida. Deve ser um número positivo em centímetros.',
      'MEASURE_INVALID_HEIGHT',
      { height },
    )
  }
}

/**
 * Error thrown when measure waist validation fails
 */
export class MeasureInvalidWaistError extends ValidationError {
  constructor(waist: unknown) {
    super(
      'Cintura inválida. Deve ser um número positivo em centímetros.',
      'MEASURE_INVALID_WAIST',
      { waist },
    )
  }
}

/**
 * Error thrown when measure hip validation fails
 */
export class MeasureInvalidHipError extends ValidationError {
  constructor(hip: unknown) {
    super(
      'Quadril inválido. Deve ser um número positivo em centímetros.',
      'MEASURE_INVALID_HIP',
      { hip },
    )
  }
}

/**
 * Error thrown when measure neck validation fails
 */
export class MeasureInvalidNeckError extends ValidationError {
  constructor(neck: unknown) {
    super(
      'Pescoço inválido. Deve ser um número positivo em centímetros.',
      'MEASURE_INVALID_NECK',
      { neck },
    )
  }
}

/**
 * Error thrown when measure timestamp validation fails
 */
export class MeasureInvalidTimestampError extends ValidationError {
  constructor(timestamp: unknown) {
    super(
      'Timestamp da medida inválido. Deve ser uma data válida.',
      'MEASURE_INVALID_TIMESTAMP',
      { timestamp },
    )
  }
}

/**
 * Error thrown when measure values are unrealistic
 */
export class MeasureUnrealisticValueError extends BusinessRuleError {
  constructor(measureType: string, value: number, min: number, max: number) {
    super(
      `Valor irrealista para ${measureType}: ${value}cm. Deve estar entre ${min}cm e ${max}cm.`,
      'MEASURE_UNREALISTIC_VALUE',
      { measureType, value, min, max },
    )
  }
}

/**
 * Error thrown when measure timestamp is in the future
 */
export class MeasureFutureTimestampError extends BusinessRuleError {
  constructor(timestamp: Date) {
    super(
      `Data da medida não pode ser no futuro: ${timestamp.toISOString()}.`,
      'MEASURE_FUTURE_TIMESTAMP',
      { timestamp: timestamp.toISOString() },
    )
  }
}

/**
 * Error thrown when required measurements are missing for gender
 */
export class MeasureMissingRequiredFieldError extends BusinessRuleError {
  constructor(gender: string, missingField: string) {
    super(
      `Campo obrigatório ausente para ${gender}: ${missingField}.`,
      'MEASURE_MISSING_REQUIRED_FIELD',
      { gender, missingField },
    )
  }
}

/**
 * Error thrown when measurement frequency is too high
 */
export class MeasureTooFrequentError extends BusinessRuleError {
  constructor(lastMeasurement: Date, minInterval: number) {
    super(
      `Medição muito frequente. Última medição: ${lastMeasurement.toISOString()}. Intervalo mínimo: ${minInterval} horas.`,
      'MEASURE_TOO_FREQUENT',
      { lastMeasurement: lastMeasurement.toISOString(), minInterval },
    )
  }
}

/**
 * Error thrown when body fat calculation fails
 */
export class MeasureBodyFatCalculationError extends BusinessRuleError {
  constructor(reason: string, measurements: Record<string, number>) {
    super(
      `Erro no cálculo de gordura corporal: ${reason}`,
      'MEASURE_BODY_FAT_CALCULATION_ERROR',
      { reason, measurements },
    )
  }
}

/**
 * Error thrown when measure proportions are inconsistent
 */
export class MeasureInconsistentProportionsError extends BusinessRuleError {
  constructor(measurement1: string, measurement2: string, ratio: number) {
    super(
      `Proporções inconsistentes entre ${measurement1} e ${measurement2}: ratio ${ratio}`,
      'MEASURE_INCONSISTENT_PROPORTIONS',
      { measurement1, measurement2, ratio },
    )
  }
}
