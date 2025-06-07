// Application layer for search cache operations, migrated from legacy controller
// All error handling is done here, domain remains pure
import {
  type CachedSearch,
  cachedSearchSchema,
} from '~/legacy/model/cachedSearch'
import supabase from '~/legacy/utils/supabase'
import { handleApiError } from '~/shared/error/errorHandler'

const TABLE = 'cached_searches'

/**
 * Checks if a search is cached.
 * @param search - The search string.
 * @returns True if cached, false otherwise.
 */
export const isSearchCached = async (search: CachedSearch['search']) => {
  try {
    const cached = ((await supabase.from(TABLE).select()).data ?? []).map(
      (data) => cachedSearchSchema.parse(data),
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
    throw error
  }
}

/**
 * Marks a search as cached.
 * @param search - The search string.
 */
export const markSearchAsCached = async (search: CachedSearch['search']) => {
  try {
    if (await isSearchCached(search)) {
      return
    }
    await supabase.from(TABLE).upsert({ search: search.toLowerCase() }).select()
  } catch (error) {
    handleApiError(error, {
      component: 'searchCache',
      operation: 'markSearchAsCached',
      additionalData: { search },
    })
    throw error
  }
}

/**
 * Unmarks a search as cached.
 * @param search - The search string.
 */
export const unmarkSearchAsCached = async (search: CachedSearch['search']) => {
  try {
    await supabase.from(TABLE).delete().match({ search }).select()
  } catch (error) {
    handleApiError(error, {
      component: 'searchCache',
      operation: 'unmarkSearchAsCached',
      additionalData: { search },
    })
    throw error
  }
}

export {}
