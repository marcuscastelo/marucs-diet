// Application layer for search cache operations, migrated from legacy controller
// All error handling is done here, domain remains pure
import supabase from '~/legacy/utils/supabase'
import {
  type CachedSearch,
  cachedSearchSchema,
} from '~/modules/search/application/cachedSearch'
import { handleApiError } from '~/shared/error/errorHandler'
import { parseWithStack } from '~/shared/utils/parseWithStack'

const TABLE = 'cached_searches'

/**
 * Checks if a search is cached.
 * @param search - The search string.
 * @returns True if cached, false otherwise.
 */
export const isSearchCached = async (
  search: CachedSearch['search'],
): Promise<boolean> => {
  try {
    const cached = ((await supabase.from(TABLE).select()).data ?? []).map(
      (data) => parseWithStack(cachedSearchSchema, data),
    )
    return cached.some(
      (cache) =>
        cache.search.toLowerCase() ===
        /* TODO:   Check if equality is a bug */ search.toLowerCase(),
    )
  } catch (error) {
    handleApiError(error, {
      component: 'searchCache',
      operation: 'isSearchCached',
      additionalData: { search },
    })
    return false
  }
}

/**
 * Marks a search as cached.
 * @param search - The search string.
 * @returns True if marked, false otherwise.
 */
export const markSearchAsCached = async (
  search: CachedSearch['search'],
): Promise<boolean> => {
  try {
    if (await isSearchCached(search)) {
      return true
    }
    await supabase.from(TABLE).upsert({ search: search.toLowerCase() }).select()
    return true
  } catch (error) {
    handleApiError(error, {
      component: 'searchCache',
      operation: 'markSearchAsCached',
      additionalData: { search },
    })
    return false
  }
}

/**
 * Unmarks a search as cached.
 * @param search - The search string.
 * @returns True if unmarked, false otherwise.
 */
export const unmarkSearchAsCached = async (
  search: CachedSearch['search'],
): Promise<boolean> => {
  try {
    await supabase
      .from(TABLE)
      .delete()
      .match({ search: search.toLowerCase() })
      .select()
    return true
  } catch (error) {
    handleApiError(error, {
      component: 'searchCache',
      operation: 'unmarkSearchAsCached',
      additionalData: { search },
    })
    return false
  }
}

export {}
