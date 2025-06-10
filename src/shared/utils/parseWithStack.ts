import { z, ZodError, ZodTypeAny } from 'zod'

/**
 * Parses data with a Zod schema and always throws a JS Error with stack trace on failure.
 * @param schema - The Zod schema to use for parsing
 * @param data - The data to parse
 * @returns The parsed data if valid
 * @throws Error with stack trace and Zod issues if invalid
 */
export function parseWithStack<S extends ZodTypeAny>(
  schema: S,
  data: unknown,
): z.output<S> {
  try {
    // eslint-disable-next-line no-restricted-syntax, @typescript-eslint/no-unsafe-return
    return schema.parse(data)
  } catch (err) {
    if (err instanceof ZodError) {
      const error = new Error(err.message)
      // Attach Zod issues for debugging
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      ;(error as any).issues = err.issues
      throw error
    }
    throw err
  }
}
