import { jsonParseWithStack } from '~/shared/utils/jsonParseWithStack'

export function deepCopy<T extends object | undefined | null>(
  obj: T,
): NonNullable<T> | null {
  return jsonParseWithStack(JSON.stringify(obj ?? null))
}
