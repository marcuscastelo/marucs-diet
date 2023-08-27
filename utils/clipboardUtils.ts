import { z } from 'zod'

export function deserialize<T extends z.ZodType>(
  clipboard: string,
  allowedSchema: T,
): z.infer<T> | null {
  const parsed = JSON.parse(clipboard)
  const result = allowedSchema.safeParse(parsed)
  if (!result.success) {
    console.error('Invalid clipboard data')
    console.error(result.error)
    return null
  }
  return result.data
}
