import {
  type DayDiet,
  dayDietSchema,
} from '~/modules/diet/day-diet/domain/dayDiet'
import { type User } from '~/modules/user/domain/user'
import { type DbReady, enforceDbReady } from '~/legacy/utils/newDbRecord'
import supabase from '~/legacy/utils/supabase'
import { type DayRepository } from '~/modules/diet/day-diet/domain/dayDietRepository'
import { type Accessor, createSignal } from 'solid-js'

// TODO: Delete old days table and rename days_test to days
export const SUPABASE_TABLE_DAYS = 'days_test'

export function createSupabaseDayRepository(): DayRepository {
  return {
    // fetchAllUserDayIndexes: fetchUserDayIndexes,
    fetchAllUserDayDiets,
    fetchDayDiet,
    insertDayDiet,
    updateDayDiet,
    deleteDayDiet,
  }
}

/**
 * // TODO: Replace userDays with userDayIndexes
 * @deprecated should be replaced by userDayIndexes
 */
const [userDays, setUserDays] = createSignal<readonly DayDiet[]>([])
// const [userDayIndexes, setUserDayIndexes] = createSignal<readonly DayIndex[]>([])

// TODO: better error handling
async function fetchDayDiet(_dayId: DayDiet['id']): Promise<DayDiet | null> {
  //   // TODO: filter userId in query
  //   console.debug(`[supabaseDayRepository] fetchDayDiet(${dayId})`)
  //   const { data, error } = await supabase.from(SUPABASE_TABLE_DAYS).select().eq('id', dayId)

  //   if (error !== null) {
  //     throw error
  //   }

  //   const dayDiets = dayDietSchema.array().parse(data ?? [])

  //   console.debug(
  //     `[supabaseDayRepository] fetchDayDiet returned ${dayDiets.length} days`
  //   )

  //   return dayDiets[0] ?? null
  // }

  // // TODO: better error handling
  // async function fetchUserDayIndexes (
  //   userId: User['id']
  // ): Promise<Accessor<readonly DayIndex[]>> {
  //   // TODO: filter userId in query
  //   console.debug(`[supabaseDayRepository] fetchUserDayIndexes(${userId})`)
  //   const { data, error } = await supabase
  //     .from(SUPABASE_TABLE_DAYS)
  //     .select('id, target_day, owner')
  //     .eq('owner', userId)

  //   if (error !== null) {
  //     console.error('Error while fetching user day indexes: ', error)
  //     throw error
  //   }

  //   const dayIndexes = dayIndexSchema.array().parse(data ?? [])

  //   console.debug(
  //     `[supabaseDayRepository] fetchUserDayIndexes returned ${dayIndexes.length} days`
  //   )
  //   setUserDayIndexes(dayIndexes)
  //   return userDayIndexes
  return null
}

// TODO: better error handling
async function fetchAllUserDayDiets(
  userId: User['id'],
): Promise<Accessor<readonly DayDiet[]>> {
  console.debug(`[supabaseDayRepository] fetchUserDays(${userId})`)
  const { data, error } = await supabase
    .from(SUPABASE_TABLE_DAYS)
    .select()
    .eq('owner', userId)
    .order('target_day', { ascending: true })

  if (error !== null) {
    throw error
  }

  const days = data
    .map((day) => dayDietSchema.safeParse(day))
    .map((result) => {
      if (result.success) {
        return result.data
      }
      console.error('Error while parsing day: ', result.error)
      throw result.error
    })

  console.log('days', days)

  console.debug(
    `[supabaseDayRepository] fetchUserDays returned ${days.length} days`,
  )
  setUserDays(days)

  return userDays
}

// TODO: Change upserts to inserts on the entire app
const insertDayDiet = async (
  newDay: DbReady<DayDiet>,
): Promise<DayDiet | null> => {
  const day = enforceDbReady(newDay)

  const { data: days, error } = await supabase
    .from(SUPABASE_TABLE_DAYS)
    .upsert(day)
    .select()
  if (error !== null) {
    throw error
  }

  return dayDietSchema.parse(days?.[0] ?? null)
}

const updateDayDiet = async (
  id: DayDiet['id'],
  day: DbReady<DayDiet>,
): Promise<DayDiet> => {
  const newDay = enforceDbReady(day)
  const { data, error } = await supabase
    .from(SUPABASE_TABLE_DAYS)
    .update(newDay)
    .eq('id', id)
    .select()

  if (error !== null) {
    console.error('Error while updating day: ', newDay)
    console.error(error)
    throw error
  }

  return dayDietSchema.parse(data?.[0] ?? null)
}

const deleteDayDiet = async (id: DayDiet['id']): Promise<void> => {
  const { error } = await supabase
    .from(SUPABASE_TABLE_DAYS)
    .delete()
    .eq('id', id)
    .select()

  if (error !== null) {
    throw error
  }

  const userId = userDays().find((day) => day.id === id)?.owner
  if (userId === undefined) {
    throw new Error(
      `Invalid state: userId not found for day ${id} on local cache`,
    )
  }
}
