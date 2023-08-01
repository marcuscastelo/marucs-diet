import { User, userSchema } from '@/model/userModel'
import supabase from '@/utils/supabase'

const TABLE = 'users'

export const listUsers = async (): Promise<User[]> =>
  ((await supabase.from(TABLE).select()).data ?? []).map((user) =>
    userSchema.parse(user),
  )

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
