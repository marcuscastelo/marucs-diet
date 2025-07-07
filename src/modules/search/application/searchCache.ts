// Application layer for search cache operations, migrated from legacy controller
// All error handling is done here, domain remains pure
import { type CachedSearch } from '~/modules/search/application/cachedSearch'
import { handleApplicationError, handleInfrastructureError, handleValidationError } from '~/shared/error/errorHandler'
import supabase from '~/shared/utils/supabase'

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
    const { data, error } = await supabase
      .from(TABLE)
      .select('search')
      .eq('search', search.toLowerCase())
    if (error !== null) {
      handleInfrastructureError(error, { operation: "moduleOperation", entityType: "Entity", module: "module", component: "application" })
      return false
    }
    return data.length > 0
  } catch (error) {
    handleInfrastructureError(error, { operation: "moduleOperation", entityType: "Entity", module: "module", component: "application" })
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
    handleInfrastructureError(error, { operation: "moduleOperation", entityType: "Entity", module: "module", component: "application" })
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
    handleInfrastructureError(error, { operation: "moduleOperation", entityType: "Entity", module: "module", component: "application" })
    return false
  }
}

export {}
