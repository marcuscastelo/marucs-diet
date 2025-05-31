import { type User, type NewUser } from '~/modules/user/domain/user'
import supabase from '~/legacy/utils/supabase'
import { type UserRepository } from '~/modules/user/domain/userRepository'
import {
  createUserFromDAO,
  userDAOSchema,
  createInsertUserDAOFromNewUser,
  createUpdateUserDAOFromNewUser,
} from '~/modules/user/infrastructure/userDAO'

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

  const userDAOs = userDAOSchema.array().parse(data ?? [])
  return userDAOs.map(createUserFromDAO)
}

const fetchUser = async (id: User['id']): Promise<User | null> => {
  const { data, error } = await supabase
    .from(SUPABASE_TABLE_USERS)
    .select()
    .eq('id', id)

  if (error !== null) {
    throw error
  }

  const userDAOs = userDAOSchema.array().parse(data ?? [])
  const users = userDAOs.map(createUserFromDAO)

  return users[0] ?? null
}

const insertUser = async (newUser: NewUser): Promise<User | null> => {
  const createDAO = createInsertUserDAOFromNewUser(newUser)

  const { data, error } = await supabase
    .from(SUPABASE_TABLE_USERS)
    .insert(createDAO)
    .select()

  if (error !== null) {
    throw error
  }

  const userDAOs = userDAOSchema.array().parse(data ?? [])
  const users = userDAOs.map(createUserFromDAO)

  return users[0] ?? null
}

const updateUser = async (
  id: User['id'],
  newUser: NewUser,
): Promise<User | null> => {
  const updateDAO = createUpdateUserDAOFromNewUser(newUser)

  const { data, error } = await supabase
    .from(SUPABASE_TABLE_USERS)
    .update(updateDAO)
    .eq('id', id)
    .select()

  if (error !== null) {
    throw error
  }

  const userDAOs = userDAOSchema.array().parse(data ?? [])
  const users = userDAOs.map(createUserFromDAO)

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
