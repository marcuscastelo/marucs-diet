import { type Accessor, createSignal } from 'solid-js'

import {
  type DayDiet,
  dayDietSchema,
  type NewDayDiet,
} from '~/modules/diet/day-diet/domain/dayDiet'
import { type DayRepository } from '~/modules/diet/day-diet/domain/dayDietRepository'
import {
  createInsertLegacyDayDietDAOFromNewDayDiet,
  daoToDayDiet,
  type DayDietDAO,
} from '~/modules/diet/day-diet/infrastructure/dayDietDAO'
import {
  type LegacyMeal,
  migrateLegacyMealsToUnified,
} from '~/modules/diet/day-diet/infrastructure/migrationUtils'
import { type User } from '~/modules/user/domain/user'
import {
  handleApiError,
  handleValidationError,
  wrapErrorWithStack,
} from '~/shared/error/errorHandler'
import supabase from '~/shared/utils/supabase'

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
/**
 * Fetches a DayDiet by its ID.
 * Throws on error or if not found.
 * @param dayId - The DayDiet ID
 * @returns The DayDiet
 * @throws Error if not found or on API/validation error
 */
async function fetchDayDiet(dayId: DayDiet['id']): Promise<DayDiet> {
  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE_DAYS)
      .select()
      .eq('id', dayId)

    if (error !== null) {
      handleApiError(error)
      throw error
    }

    const dayDiets = Array.isArray(data) ? data : []
    if (dayDiets.length === 0) {
      handleValidationError('DayDiet not found', {
        component: 'supabaseDayRepository',
        operation: 'fetchDayDiet',
        additionalData: { dayId },
      })
      throw new Error('DayDiet not found')
    }
    const migratedDay = migrateDayDataIfNeeded(dayDiets[0])
    const result = dayDietSchema.safeParse(migratedDay)
    if (!result.success) {
      handleValidationError('DayDiet invalid', {
        component: 'supabaseDayRepository',
        operation: 'fetchDayDiet',
        additionalData: { dayId, parseError: result.error },
      })
      throw new Error('DayDiet invalid')
    }
    return result.data
  } catch (err) {
    handleApiError(err)
    throw err
  }
}

/**
 * Type for raw database data before validation
 */
type RawDayData = {
  meals?: unknown[]
  [key: string]: unknown
}

/**
 * Migrates day data from legacy format (meals with groups) to new format (meals with items)
 * if needed. Returns the data unchanged if it's already in the new format.
 */
function migrateDayDataIfNeeded(dayData: unknown): unknown {
  // Type guard to check if dayData has the expected structure
  if (
    typeof dayData !== 'object' ||
    dayData === null ||
    !('meals' in dayData) ||
    !Array.isArray((dayData as RawDayData).meals)
  ) {
    return dayData
  }

  const rawDay = dayData as RawDayData
  const meals = rawDay.meals || []

  // Check if any meal has the legacy 'groups' property instead of 'items'
  const hasLegacyFormat = meals.some(
    (meal: unknown) =>
      typeof meal === 'object' &&
      meal !== null &&
      'groups' in meal &&
      !('items' in meal),
  )

  if (!hasLegacyFormat) {
    return dayData // Already in new format
  }

  // Migrate meals from legacy format to unified format
  const migratedMeals = meals.map((meal: unknown) => {
    if (
      typeof meal === 'object' &&
      meal !== null &&
      'groups' in meal &&
      !('items' in meal)
    ) {
      // This is a legacy meal, migrate it
      const legacyMeal = meal as LegacyMeal
      return migrateLegacyMealsToUnified([legacyMeal])[0]
    }
    return meal // Already in new format or different structure
  })

  return {
    ...rawDay,
    meals: migratedMeals,
  }
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
    handleApiError(error)
    throw error
  }

  const days = data
    .map((day) => {
      // Check if day contains legacy meal format and migrate if needed
      const migratedDay = migrateDayDataIfNeeded(day)
      return dayDietSchema.safeParse(migratedDay)
    })
    .map((result) => {
      if (result.success) {
        return result.data
      }
      handleValidationError('Error while parsing day', {
        component: 'supabaseDayRepository',
        operation: 'fetchAllUserDayDiets',
        additionalData: { parseError: result.error },
      })
      throw wrapErrorWithStack(result.error)
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
  // Use legacy format for canary strategy
  const createDAO = createInsertLegacyDayDietDAOFromNewDayDiet(newDay)

  const { data: days, error } = await supabase
    .from(SUPABASE_TABLE_DAYS)
    .insert(createDAO)
    .select()
  if (error !== null) {
    throw wrapErrorWithStack(error)
  }

  const dayDAO = days[0] as DayDietDAO | undefined
  if (dayDAO !== undefined) {
    // Migrate the returned data if needed before converting to domain
    const migratedDay = migrateDayDataIfNeeded(dayDAO)
    return daoToDayDiet(migratedDay as DayDietDAO)
  }
  return null
}

const updateDayDiet = async (
  id: DayDiet['id'],
  newDay: NewDayDiet,
): Promise<DayDiet> => {
  // Use legacy format for canary strategy
  const updateDAO = createInsertLegacyDayDietDAOFromNewDayDiet(newDay)

  const { data, error } = await supabase
    .from(SUPABASE_TABLE_DAYS)
    .update(updateDAO)
    .eq('id', id)
    .select()

  if (error !== null) {
    handleApiError(error)
    throw error
  }

  const dayDAO = data[0] as DayDietDAO
  // Migrate the returned data if needed before converting to domain
  const migratedDay = migrateDayDataIfNeeded(dayDAO)
  return daoToDayDiet(migratedDay as DayDietDAO)
}

const deleteDayDiet = async (id: DayDiet['id']): Promise<void> => {
  const { error } = await supabase
    .from(SUPABASE_TABLE_DAYS)
    .delete()
    .eq('id', id)
    .select()

  if (error !== null) {
    throw wrapErrorWithStack(error)
  }

  const userId = userDays().find((day) => day.id === id)?.userId
  if (userId === undefined) {
    throw new Error(
      `Invalid state: userId not found for day ${id} on local cache`,
    )
  }
}
