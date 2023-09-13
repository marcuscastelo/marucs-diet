import { RecentFood, recentFoodSchema } from '@/model/recentFoodModel'
import { New, enforceNew } from '@/utils/newDbRecord'
import supabase from '@/utils/supabase'

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

  if (error) {
    console.error(error)
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

  if (error) {
    console.error(error)
    throw error
  }

  return recentFoodSchema.array().parse(data)
}

export async function insertRecentFood(newRecentFood: New<RecentFood>) {
  const recentFood = enforceNew(newRecentFood)
  const { data, error } = await supabase.from(TABLE).insert(recentFood).select()

  if (error) {
    console.error(error)
    throw error
  }

  return recentFoodSchema.parse(data?.[0])
}

export async function updateRecentFood(
  recentFoodId: RecentFood['id'],
  newRecentFood: New<RecentFood>,
) {
  const recentFood = enforceNew(newRecentFood)
  const { data, error } = await supabase
    .from(TABLE)
    .update(recentFood)
    .eq('id', recentFoodId)
    .select()

  if (error) {
    console.error(error)
    throw error
  }

  return recentFoodSchema.parse(data?.[0])
}

export async function deleteRecentFood(id: RecentFood['id']) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)

  if (error) {
    console.error(error)
    throw error
  }
}
