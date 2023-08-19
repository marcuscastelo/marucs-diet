import { User, userSchema } from '@/model/userModel'
import supabase from '@/utils/supabase'

const TABLE = 'users'

export const fetchUsers = async (): Promise<User[]> =>
  ((await supabase.from(TABLE).select()).data ?? []).map((user) =>
    userSchema.parse(user),
  )

export const fetchUser = async (id: User['id']): Promise<User | undefined> => {
  const { data, error } = await supabase.from(TABLE).select().eq('id', id)

  if (error) {
    console.error(error)
    throw error
  }

  if (data?.length === 0) {
    return undefined
  }

  return userSchema.parse(data?.[0] ?? null)
}

export const updateUser = async (id: User['id'], user: User): Promise<User> => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(user)
    .eq('id', id)
    .select()

  if (error) {
    throw error
  }

  return userSchema.parse(data?.[0] ?? null)
}
