import {
  isTemplateFood,
  isTemplateRecipe,
  Template,
  templateSchema,
} from '~/modules/diet/template/domain/template'
import { parseWithStack } from '~/shared/utils/parseWithStack'

/**
 * Validates and transforms a raw object into a Template domain object.
 * @param input - The raw object to validate/transform
 * @returns The validated Template object
 */
export function transformTemplate(input: unknown): Template {
  return parseWithStack(templateSchema, input)
}

export { isTemplateFood, isTemplateRecipe }
