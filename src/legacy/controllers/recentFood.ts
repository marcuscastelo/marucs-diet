import {
  type RecentFood,
  recentFoodSchema,
} from '~/modules/recent-food/domain/recentFood'
import { type DbReady, enforceDbReady } from '~/legacy/utils/newDbRecord'
import supabase from '~/legacy/utils/supabase'
import { handleApiError } from '~/shared/error/errorHandler'

const TABLE = 'recent_foods'

export async function fetchRecentFoodByUserIdAndFoodId(
  userId: RecentFood['user_id'],
  foodId: RecentFood['food_id'],
) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .eq('food_id', foodId)

  if (error !== null) {
    handleApiError(error, {
      component: 'recentFood',
      operation: 'fetchRecentFoodByUserIdAndFoodId',
      additionalData: { userId, foodId }
    })
    throw error
  }

  return recentFoodSchema.array().parse(data).at(0) ?? null
}

export async function fetchUserRecentFoods(userId: RecentFood['user_id']) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('last_used', { ascending: false })

  if (error !== null) {
    handleApiError(error, {
      component: 'recentFood',
      operation: 'fetchUserRecentFoods',
      additionalData: { userId }
    })
    throw error
  }

  return recentFoodSchema.array().parse(data)
}

export async function insertRecentFood(newRecentFood: DbReady<RecentFood>) {
  const recentFood = enforceDbReady(newRecentFood)
  const { data, error } = await supabase.from(TABLE).insert(recentFood).select()

  if (error !== null) {
    handleApiError(error, {
      component: 'recentFood',
      operation: 'insertRecentFood',
      additionalData: { recentFood }
    })
    throw error
  }

  return recentFoodSchema.parse(data?.[0])
}

export async function updateRecentFood(
  recentFoodId: RecentFood['id'],
  newRecentFood: DbReady<RecentFood>,
) {
  const recentFood = enforceDbReady(newRecentFood)
  const { data, error } = await supabase
    .from(TABLE)
    .update(recentFood)
    .eq('id', recentFoodId)
    .select()

  if (error !== null) {
    handleApiError(error, {
      component: 'recentFood',
      operation: 'updateRecentFood',
      additionalData: { recentFoodId, recentFood }
    })
    throw error
  }

  return recentFoodSchema.parse(data?.[0])
}

export async function deleteRecentFoodByFoodId(
  userId: RecentFood['user_id'],
  foodId: RecentFood['food_id'],
) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('user_id', userId)
    .eq('food_id', foodId)

  if (error !== null) {
    handleApiError(error, {
      component: 'recentFood',
      operation: 'deleteRecentFoodByFoodId',
      additionalData: { userId, foodId }
    })
    throw error
  }
}
