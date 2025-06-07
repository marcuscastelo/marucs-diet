import { type Accessor, createSignal } from 'solid-js'
import supabase from '~/legacy/utils/supabase'
import {
  type DayDiet,
  dayDietSchema,
  type NewDayDiet,
} from '~/modules/diet/day-diet/domain/dayDiet'
import { type DayRepository } from '~/modules/diet/day-diet/domain/dayDietRepository'
import { type User } from '~/modules/user/domain/user'
import {
  handleApiError,
  handleValidationError,
} from '~/shared/error/errorHandler'
import {
  createInsertDayDietDAOFromNewDayDiet,
  daoToDayDiet,
  type DayDietDAO,
} from '~/modules/diet/day-diet/infrastructure/dayDietDAO'

// TODO:   Delete old days table and rename days_test to days
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
 * // TODO:   Replace userDays with userDayIndexes
 * @deprecated should be replaced by userDayIndexes
 */
const [userDays, setUserDays] = createSignal<readonly DayDiet[]>([])
// const [userDayIndexes, setUserDayIndexes] = createSignal<readonly DayIndex[]>([])

// TODO:   better error handling
async function fetchDayDiet(_dayId: DayDiet['id']): Promise<DayDiet | null> {
  //   // TODO:   filter userId in query
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

  // // TODO:   better error handling
  // async function fetchUserDayIndexes (
  //   userId: User['id']
  // ): Promise<Accessor<readonly DayIndex[]>> {
  //   // TODO:   filter userId in query
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

// TODO:   better error handling
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
    handleApiError(error, {
      component: 'supabaseDayRepository',
      operation: 'fetchAllUserDayDiets',
      additionalData: { userId },
    })
    throw error
  }

  const days = data
    .map((day) => dayDietSchema.safeParse(day))
    .map((result) => {
      if (result.success) {
        return result.data
      }
      handleValidationError('Error while parsing day', {
        component: 'supabaseDayRepository',
        operation: 'fetchAllUserDayDiets',
        additionalData: { parseError: result.error },
      })
      throw result.error
    })

  console.log('days', days)

  console.debug(
    `[supabaseDayRepository] fetchUserDays returned ${days.length} days`,
  )
  setUserDays(days)

  return userDays
}

// TODO:   Change upserts to inserts on the entire app
const insertDayDiet = async (newDay: NewDayDiet): Promise<DayDiet | null> => {
  const createDAO = createInsertDayDietDAOFromNewDayDiet(newDay)

  const { data: days, error } = await supabase
    .from(SUPABASE_TABLE_DAYS)
    .insert(createDAO)
    .select()
  if (error !== null) {
    throw error
  }

  const dayDAO = days[0] as DayDietDAO | undefined
  if (dayDAO !== undefined) {
    return daoToDayDiet(dayDAO)
  }
  return null
}

const updateDayDiet = async (
  id: DayDiet['id'],
  newDay: NewDayDiet,
): Promise<DayDiet> => {
  const updateDAO = createInsertDayDietDAOFromNewDayDiet(newDay)

  const { data, error } = await supabase
    .from(SUPABASE_TABLE_DAYS)
    .update(updateDAO)
    .eq('id', id)
    .select()

  if (error !== null) {
    handleApiError(error, {
      component: 'supabaseDayRepository',
      operation: 'updateDayDiet',
      additionalData: { id, dayData: updateDAO },
    })
    throw error
  }

  const dayDAO = data[0] as DayDietDAO
  return daoToDayDiet(dayDAO)
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
