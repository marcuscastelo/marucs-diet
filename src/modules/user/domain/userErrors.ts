import { BusinessRuleError, ValidationError } from '~/shared/domain/errors'

/**
 * Error thrown when user name validation fails
 */
export class UserInvalidNameError extends ValidationError {
  constructor(name: string) {
    super(
      `Nome do usuário inválido: '${name}'. O nome deve ser uma string não vazia.`,
      'USER_INVALID_NAME',
      { name },
    )
  }
}

/**
 * Error thrown when user gender validation fails
 */
export class UserInvalidGenderError extends ValidationError {
  constructor(gender: unknown) {
    super(
      `Gênero do usuário inválido: '${String(gender)}'. Deve ser 'male' ou 'female'.`,
      'USER_INVALID_GENDER',
      { gender },
    )
  }
}

/**
 * Error thrown when user diet type validation fails
 */
export class UserInvalidDietError extends ValidationError {
  constructor(diet: unknown) {
    super(
      `Tipo de dieta inválido: '${String(diet)}'. Deve ser 'cut', 'normo' ou 'bulk'.`,
      'USER_INVALID_DIET',
      { diet },
    )
  }
}

/**
 * Error thrown when user birthdate validation fails
 */
export class UserInvalidBirthdateError extends ValidationError {
  constructor(birthdate: unknown) {
    super(
      'Data de nascimento inválida. Deve estar no formato YYYY-MM-DD.',
      'USER_INVALID_BIRTHDATE',
      { birthdate },
    )
  }
}

/**
 * Error thrown when user desired weight validation fails
 */
export class UserInvalidDesiredWeightError extends ValidationError {
  constructor(weight: unknown) {
    super(
      'Peso desejado inválido. Deve ser um número positivo.',
      'USER_INVALID_DESIRED_WEIGHT',
      { weight },
    )
  }
}

/**
 * Error thrown when user favorite foods validation fails
 */
export class UserInvalidFavoriteFoodsError extends ValidationError {
  constructor(favoriteFoods: unknown) {
    super(
      'Lista de alimentos favoritos inválida. Deve ser um array de IDs de alimentos.',
      'USER_INVALID_FAVORITE_FOODS',
      { favoriteFoods },
    )
  }
}

/**
 * Error thrown when user age is invalid based on birthdate
 */
export class UserInvalidAgeError extends BusinessRuleError {
  constructor(birthdate: string, calculatedAge: number) {
    super(
      `Idade calculada inválida: ${calculatedAge} anos. Verifique a data de nascimento.`,
      'USER_INVALID_AGE',
      { birthdate, calculatedAge },
    )
  }
}

/**
 * Error thrown when user desired weight is unrealistic
 */
export class UserUnrealisticDesiredWeightError extends BusinessRuleError {
  constructor(weight: number, minWeight: number, maxWeight: number) {
    super(
      `Peso desejado irrealista: ${weight}kg. Deve estar entre ${minWeight}kg e ${maxWeight}kg.`,
      'USER_UNREALISTIC_DESIRED_WEIGHT',
      { weight, minWeight, maxWeight },
    )
  }
}

/**
 * Error thrown when user has too many favorite foods
 */
export class UserTooManyFavoriteFoodsError extends BusinessRuleError {
  constructor(count: number, maxAllowed: number) {
    super(
      `Muitos alimentos favoritos: ${count}. Máximo permitido: ${maxAllowed}.`,
      'USER_TOO_MANY_FAVORITE_FOODS',
      { count, maxAllowed },
    )
  }
}

/**
 * Error thrown when user birthdate is in the future
 */
export class UserFutureBirthdateError extends BusinessRuleError {
  constructor(birthdate: string) {
    super(
      `Data de nascimento não pode ser no futuro: ${birthdate}.`,
      'USER_FUTURE_BIRTHDATE',
      { birthdate },
    )
  }
}

/**
 * Error thrown when user is too young
 */
export class UserTooYoungError extends BusinessRuleError {
  constructor(age: number, minAge: number) {
    super(
      `Usuário muito jovem: ${age} anos. Idade mínima: ${minAge} anos.`,
      'USER_TOO_YOUNG',
      { age, minAge },
    )
  }
}
