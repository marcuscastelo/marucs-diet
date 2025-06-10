import supabase from '~/legacy/utils/supabase'
import { type NewUser, type User } from '~/modules/user/domain/user'
import { type UserRepository } from '~/modules/user/domain/userRepository'
import {
  createInsertUserDAOFromNewUser,
  createUpdateUserDAOFromNewUser,
  createUserFromDAO,
  userDAOSchema,
} from '~/modules/user/infrastructure/userDAO'
import { parseWithStack } from '~/shared/utils/parseWithStack'
import { wrapErrorWithStack } from '~/shared/error/errorHandler'

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
    throw wrapErrorWithStack(error)
  }

  const userDAOs = parseWithStack(userDAOSchema.array(), data)
  return userDAOs.map(createUserFromDAO)
}

const fetchUser = async (id: User['id']): Promise<User | null> => {
  const { data, error } = await supabase
    .from(SUPABASE_TABLE_USERS)
    .select()
    .eq('id', id)

  if (error !== null) {
    throw wrapErrorWithStack(error)
  }

  const userDAOs = parseWithStack(userDAOSchema.array(), data)
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
    throw wrapErrorWithStack(error)
  }

  const userDAOs = parseWithStack(userDAOSchema.array(), data)
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
    throw wrapErrorWithStack(error)
  }

  const userDAOs = parseWithStack(userDAOSchema.array(), data)
  const users = userDAOs.map(createUserFromDAO)

  return users[0] ?? null
}

const deleteUser = async (id: User['id']): Promise<void> => {
  const { error } = await supabase
    .from(SUPABASE_TABLE_USERS)
    .delete()
    .eq('id', id)

  if (error !== null) {
    throw wrapErrorWithStack(error)
  }
}
