import { type User, userSchema } from '~/modules/user/domain/user'
import supabase from '~/legacy/utils/supabase'
import { type UserRepository } from '~/modules/user/domain/userRepository'
import { type DbReady } from '~/legacy/utils/newDbRecord'

export const SUPABASE_TABLE_USERS = 'users'

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
  const { data, error } = await supabase.from(SUPABASE_TABLE_USERS).select()

  if (error !== null) {
    throw error
  }

  const users = userSchema.array().parse(data ?? [])
  return users
}

const fetchUser = async (id: DbReady<User['id']>): Promise<User | null> => {
  const { data, error } = await supabase
    .from(SUPABASE_TABLE_USERS)
    .select()
    .eq('id', id)

  if (error !== null) {
    throw error
  }

  const users = userSchema.array().parse(data ?? [])

  return users[0] ?? null
}

const insertUser = async (user: DbReady<User>): Promise<User> => {
  const { data, error } = await supabase
    .from(SUPABASE_TABLE_USERS)
    .insert(user)
    .select()

  if (error !== null) {
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
    .from(SUPABASE_TABLE_USERS)
    .update(user)
    .eq('id', id)
    .select()

  if (error !== null) {
    throw error
  }

  const users = userSchema.array().parse(data ?? [])

  return users[0] ?? null
}

const deleteUser = async (id: User['id']): Promise<void> => {
  const { error } = await supabase
    .from(SUPABASE_TABLE_USERS)
    .delete()
    .eq('id', id)

  if (error !== null) {
    throw error
  }
}
