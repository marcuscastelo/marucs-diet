import supabase from '@/legacy/utils/supabase'
import { type CachedEan } from '@/legacy/model/cachedEan'

const TABLE = 'foods'

export const isEanCached = async (ean: CachedEan['ean']) => {
  // TODO: retriggered: tratar erros e fazer o filtro na query

  const foodsWithEan = await supabase
    .from(TABLE)
    .select()
    .eq('ean', ean.toLowerCase())
  if (foodsWithEan.error !== null) {
    console.error(foodsWithEan.error)
    throw foodsWithEan.error
  }

  return foodsWithEan.data?.length !== 0
}
