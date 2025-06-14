import { createEffect, createSignal } from 'solid-js'

import { showPromise } from '~/modules/toast/application/toastManager'
import {
  demoteToNewUser,
  type NewUser,
  type User,
} from '~/modules/user/domain/user'
import {
  loadUserIdFromLocalStorage,
  saveUserIdToLocalStorage,
} from '~/modules/user/infrastructure/localStorageUserRepository'
import {
  createSupabaseUserRepository,
  SUPABASE_TABLE_USERS,
} from '~/modules/user/infrastructure/supabaseUserRepository'
import { handleApiError } from '~/shared/error/errorHandler'
import { registerSubapabaseRealtimeCallback } from '~/shared/utils/supabase'

export const DEFAULT_USER_ID = 3

const userRepository = createSupabaseUserRepository()

export const [users, setUsers] = createSignal<readonly User[]>([])

export const [currentUser, setCurrentUser] = createSignal<User | null>(null)

export const [currentUserId, setCurrentUserId] = createSignal<number>(1)

createEffect(() => {
  setCurrentUserId(loadUserIdFromLocalStorage())
  void showPromise(
    fetchCurrentUser(),
    {
      loading: 'Carregando usuário atual...',
      success: 'Usuário atual carregado com sucesso',
      error: 'Falha ao carregar usuário atual',
    },
    { context: 'background' },
  )
})

function bootstrap() {
  fetchUsers().catch((error) => {
    handleApiError(error)
  })
}

/**
 * At app start, fetch all users
 */
createEffect(() => {
  bootstrap()
})

/**
 * When realtime event occurs, fetch all users again
 */
registerSubapabaseRealtimeCallback(SUPABASE_TABLE_USERS, () => {
  bootstrap()
})

/**
 * Fetches all users and sets current user.
 * @returns Array of users or empty array on error.
 */
export async function fetchUsers(): Promise<readonly User[]> {
  try {
    const users = await userRepository.fetchUsers()
    const newCurrentUser = users.find((user) => user.id === currentUserId())
    setUsers(users)
    setCurrentUser(newCurrentUser ?? null)
    return users
  } catch (error) {
    handleApiError(error)
    setUsers([])
    setCurrentUser(null)
    return []
  }
}

/**
 * Fetches the current user.
 * @returns The current user or null on error.
 */
export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const user = await userRepository.fetchUser(currentUserId())
    setCurrentUser(user)
    return user
  } catch (error) {
    handleApiError(error)
    setCurrentUser(null)
    return null
  }
}

/**
 * Inserts a new user.
 * @param newUser - The new user data.
 * @returns True if inserted, false otherwise.
 */
export async function insertUser(newUser: NewUser): Promise<boolean> {
  try {
    await showPromise(
      userRepository.insertUser(newUser),
      {
        loading: 'Inserindo usuário...',
        success: 'Usuário inserido com sucesso',
        error: 'Falha ao inserir usuário',
      },
      { context: 'user-action', audience: 'user' },
    )
    await fetchUsers()
    return true
  } catch (error) {
    handleApiError(error)
    return false
  }
}

/**
 * Updates a user by ID.
 * @param userId - The user ID.
 * @param newUser - The new user data.
 * @returns The updated user or null on error.
 */
export async function updateUser(
  userId: User['id'],
  newUser: NewUser,
): Promise<User | null> {
  try {
    const user = await showPromise(
      userRepository.updateUser(userId, newUser),
      {
        loading: 'Atualizando informações do usuário...',
        success: 'Informações do usuário atualizadas com sucesso',
        error: 'Falha ao atualizar informações do usuário',
      },
      { context: 'user-action', audience: 'user' },
    )
    await fetchUsers()
    return user
  } catch (error) {
    handleApiError(error)
    return null
  }
}

/**
 * Deletes a user by ID.
 * @param userId - The user ID.
 * @returns True if deleted, false otherwise.
 */
export async function deleteUser(userId: User['id']): Promise<boolean> {
  try {
    await showPromise(
      userRepository.deleteUser(userId),
      {
        loading: 'Removendo usuário...',
        success: 'Usuário removido com sucesso',
        error: 'Falha ao remover usuário',
      },
      { context: 'user-action', audience: 'user' },
    )
    await fetchUsers()
    return true
  } catch (error) {
    handleApiError(error)
    return false
  }
}

export function changeToUser(userId: User['id']): void {
  saveUserIdToLocalStorage(userId)
  setCurrentUserId(userId)
}

// TODO:   Create module for favorites
export function isFoodFavorite(foodId: number): boolean {
  return currentUser()?.favorite_foods.includes(foodId) ?? false
}

export function setFoodAsFavorite(foodId: number, favorite: boolean): void {
  const currentUser_ = currentUser()
  if (currentUser_ === null) {
    handleApiError('User not initialized')
    return
  }
  const favoriteFoods = currentUser_.favorite_foods
  if (favorite) {
    if (!favoriteFoods.includes(foodId)) {
      favoriteFoods.push(foodId)
    }
  } else {
    const index = favoriteFoods.indexOf(foodId)
    if (index !== -1) {
      favoriteFoods.splice(index, 1)
    }
  }
  void updateUser(currentUser_.id, {
    ...demoteToNewUser(currentUser_),
    favorite_foods: favoriteFoods,
  })
    .then(fetchCurrentUser)
    .catch((error) => {
      handleApiError(error)
    })
}
