import { DayDiet, dayDietSchema } from '@/modules/diet/day-diet/domain/day'
import { User } from '@/modules/user/domain/user'
import { DbReady, enforceDbReady } from '@/legacy/utils/newDbRecord'
import supabase from '@/legacy/utils/supabase'
import { DayRepository } from '@/src/modules/diet/day-diet/domain/dayRepository'
import { ReadonlySignal, signal } from '@preact/signals-react'

// TODO: Delete old days table and rename days_test to days
const TABLE = 'days_test'

export function createSupabaseDayRepository(): DayRepository {
  return {
    fetchUserDays,
    insertDay: upsertDay,
    updateDay,
    deleteDay,
  }
}

const userDays = signal<readonly DayDiet[]>([])

// TODO: better error handling
async function fetchUserDays(
  userId: User['id'],
): Promise<ReadonlySignal<readonly DayDiet[]>> {
  // TODO: filter userId in query
  console.debug(`[supabaseDayRepository] fetchUserDays(${userId})`)
  const { data, error } = await supabase.from(TABLE).select()
  if (error) {
    throw error
  }

  const days = data
    .map((day) => dayDietSchema.parse(day))
    .filter((day) => day.owner === userId)
    .filter((day) => !isNaN(new Date(day.target_day).getTime()))
    .map(
      (day): DayDiet => ({
        ...day,
        target_day: day.target_day.split(' ')[0],
      }),
    )
    .sort((a, b) => {
      const aDate = new Date(a.target_day)
      const bDate = new Date(b.target_day)
      return aDate.getTime() - bDate.getTime()
    })

  console.debug(
    `[supabaseDayRepository] fetchUserDays returned ${days.length} days`,
  )
  userDays.value = days

  return userDays
}

// TODO: Change upserts to inserts on the entire app
const upsertDay = async (
  newDay: Partial<DbReady<DayDiet>>,
): Promise<DayDiet | null> => {
  const day = enforceDbReady(newDay)

  const { data: days, error } = await supabase.from(TABLE).upsert(day).select()
  if (error) {
    throw error
  }
  return dayDietSchema.parse(days?.[0] ?? null)
}

const updateDay = async (
  id: DayDiet['id'],
  day: DbReady<DayDiet>,
): Promise<DayDiet> => {
  const newDay = enforceDbReady(day)
  const { data, error } = await supabase
    .from(TABLE)
    .update(newDay)
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error while updating day: ', newDay)
    console.error(error)
    throw error
  }

  return dayDietSchema.parse(data?.[0] ?? null)
}

const deleteDay = async (id: DayDiet['id']): Promise<void> => {
  const { error } = await supabase.from(TABLE).delete().eq('id', id).select()

  if (error) {
    throw error
  }
}
