import { type z } from 'zod'

import { handleValidationError } from '~/shared/error/errorHandler'

export function deserializeClipboard<T extends z.ZodType<unknown>>(
  clipboard: string,
  allowedSchema: T,
): z.infer<T> | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(clipboard)
  } catch (error) {
    handleValidationError('Invalid JSON in clipboard', {
      component: 'clipboardUtils',
      operation: 'deserializeClipboard',
      additionalData: { clipboard, error },
    })
    return null
  }
  const result: z.SafeParseReturnType<
    unknown,
    z.infer<T>
  > = allowedSchema.safeParse(parsed)
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
