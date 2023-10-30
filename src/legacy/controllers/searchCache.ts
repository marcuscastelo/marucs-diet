import { CachedSearch, cachedSearchSchema } from '@/legacy/model/cachedSearch'
import supabase from '@/legacy/utils/supabase'

const TABLE = 'cached_searches'

export const isSearchCached = async (search: CachedSearch['search']) => {
  // TODO: retriggered: tratar erros e fazer o filtro na query
  const cached = ((await supabase.from(TABLE).select()).data ?? []).map(
    (data) => cachedSearchSchema.parse(data),
  )
  return cached.some(
    (cache) =>
      cache.search.toLowerCase() ===
      /* TODO: Check if equality is a bug */ search.toLowerCase(),
  )
}

export const markSearchAsCached = async (search: CachedSearch['search']) => {
  if (await isSearchCached(search)) {
    return
  }
  await supabase.from(TABLE).upsert({ search: search.toLowerCase() }).select()
}

export const unmarkSearchAsCached = async (search: CachedSearch['search']) => {
  await supabase.from(TABLE).delete().match({ search }).select()
}
