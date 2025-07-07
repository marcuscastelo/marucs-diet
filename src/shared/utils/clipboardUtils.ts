import { type z } from 'zod/v4'

import { handleValidationError } from '~/shared/error/errorHandler'
import { jsonParseWithStack } from '~/shared/utils/jsonParseWithStack'

export function deserializeClipboard<T extends z.ZodType<unknown>>(
  clipboard: string,
  allowedSchema: T,
): z.infer<T> | null {
  let parsed: unknown
  try {
    parsed = jsonParseWithStack(clipboard)
    if (typeof parsed !== 'object' || parsed === null) {
      handleValidationError('Clipboard JSON is not an object', {
        component: 'clipboardUtils',
        operation: 'deserializeClipboard',
        additionalData: { clipboard, parsed },
      })
      return null
    }
  } catch (error) {
    handleValidationError('Invalid JSON in clipboard', {
      component: 'clipboardUtils',
      operation: 'deserializeClipboard',
      additionalData: { clipboard, error },
    })
    return null
  }
  const result = allowedSchema.safeParse(parsed)
  if (!result.success) {
    handleValidationError('Invalid clipboard data', {
      component: 'clipboardUtils',
      operation: 'deserializeClipboard',
      additionalData: { clipboard, error: result.error },
    })
    return null
  }
  return result.data
}
