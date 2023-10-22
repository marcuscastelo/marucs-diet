import { Day, daySchema } from '@/modules/diet/day/domain/day'
import { User } from '@/modules/user/domain/user'
import { DbReady, enforceDbReady } from '@/legacy/utils/newDbRecord'
import supabase from '@/legacy/utils/supabase'
import { DayRepository } from '@/src/modules/diet/day/domain/dayRepository'

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

// TODO: better error handling
const fetchUserDays = async (userId: User['id']): Promise<readonly Day[]> =>
  ((await supabase.from(TABLE).select()).data ?? [])
    .map((day) => daySchema.parse(day))
    .filter((day) => day.owner === userId)
    .filter((day) => !isNaN(new Date(day.target_day).getTime()))
    .map(
      (day): Day => ({
        ...day,
        target_day: day.target_day.split(' ')[0],
      }),
    )
    .sort((a, b) => {
      const aDate = new Date(a.target_day)
      const bDate = new Date(b.target_day)
      return aDate.getTime() - bDate.getTime()
    })

// TODO: Change upserts to inserts on the entire app
const upsertDay = async (
  newDay: Partial<DbReady<Day>>,
): Promise<Day | null> => {
  const day = enforceDbReady(newDay)

  const { data: days, error } = await supabase.from(TABLE).upsert(day).select()
  if (error) {
    throw error
  }
  return daySchema.parse(days?.[0] ?? null)
}

const updateDay = async (id: Day['id'], day: DbReady<Day>): Promise<Day> => {
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

  return daySchema.parse(data?.[0] ?? null)
}

const deleteDay = async (id: Day['id']): Promise<void> => {
  const { error } = await supabase.from(TABLE).delete().eq('id', id).select()

  if (error) {
    throw error
  }
}
