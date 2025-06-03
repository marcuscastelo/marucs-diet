import { type z } from 'zod'
import { handleValidationError } from '~/shared/error/errorHandler'

export function deserializeClipboard<T extends z.ZodType>(
  clipboard: string,
  allowedSchema: T,
): z.infer<T> | null {
  const parsed = JSON.parse(clipboard)
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
