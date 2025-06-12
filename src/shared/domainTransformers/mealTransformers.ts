import { z } from 'zod'

import { Meal, mealSchema } from '~/modules/diet/meal/domain/meal'
import { parseWithStack } from '~/shared/utils/parseWithStack'

/**
 * Validates and transforms a raw object into a Meal domain object.
 * @param input - The raw object to validate/transform
 * @returns The validated Meal object
 */
export function transformMeal(input: unknown): Meal {
  return parseWithStack(mealSchema, input)
}
