import { type User, userSchema } from '~/modules/user/domain/user'
import supabase from '~/legacy/utils/supabase'
import { type UserRepository } from '~/modules/user/domain/userRepository'
import { type DbReady } from '~/legacy/utils/newDbRecord'

const TABLE = 'users'

export function createSupabaseUserRepository(): UserRepository {
  return {
    fetchUsers,
    fetchUser,
    insertUser,
    updateUser,
    deleteUser,
  }
}

const fetchUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from(TABLE).select()

  if (error !== null) {
    console.error(error)
    throw error
  }

  const users = userSchema.array().parse(data ?? [])
  return users
}
const fetchUser = async (id: DbReady<User['id']>): Promise<User | null> => {
  const { data, error } = await supabase.from(TABLE).select().eq('id', id)

  if (error !== null) {
    console.error(error)
    throw error
  }

  const users = userSchema.array().parse(data ?? [])

  return users[0] ?? null
}

const insertUser = async (user: DbReady<User>): Promise<User> => {
  const { data, error } = await supabase.from(TABLE).insert(user).select()

  if (error !== null) {
    console.error(error)
    throw error
  }

  const users = userSchema.array().parse(data ?? [])

  return users[0] ?? null
}

const updateUser = async (
  id: User['id'],
  user: DbReady<User>,
): Promise<User> => {
  const { data, error } = await supabase
    .from(TABLE)
    .update(user)
    .eq('id', id)
    .select()

  if (error !== null) {
    console.error(error)
    throw error
  }

  const users = userSchema.array().parse(data ?? [])

  return users[0] ?? null
}

const deleteUser = async (id: User['id']): Promise<void> => {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)

  if (error !== null) {
    console.error(error)
    throw error
  }
}
