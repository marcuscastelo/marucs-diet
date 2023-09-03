import { Day, daySchema } from '@/model/dayModel'
import { User } from '@/model/userModel'
import { New, enforceNew } from '@/utils/newDbRecord'
import supabase from '@/utils/supabase'

const TABLE = 'days_test'

// TODO: better error handling
export const listDays = async (userId: User['id']): Promise<Day[]> =>
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

export const upsertDay = async (
  day: Partial<Day> & Omit<Day, 'id'>,
): Promise<Day | null> => {
  if ('id' in day) {
    console.error('Day should not have an id') // TODO: better error handling
    delete day.id
  }
  const { data: days, error } = await supabase.from(TABLE).upsert(day).select()
  if (error) {
    throw error
  }
  return daySchema.parse(days?.[0] ?? null)
}

export const updateDay = async (id: Day['id'], day: New<Day>): Promise<Day> => {
  const newDay = enforceNew(day)
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

export const deleteDay = async (id: Day['id']): Promise<void> => {
  const { error } = await supabase.from(TABLE).delete().eq('id', id).select()

  if (error) {
    throw error
  }
}
