import {
  type User,
  type NewUser,
  demoteToNewUser,
} from '~/modules/user/domain/user'
import {
  loadUserIdFromLocalStorage,
  saveUserIdToLocalStorage,
} from '~/modules/user/infrastructure/localStorageUserRepository'
import {
  createSupabaseUserRepository,
  SUPABASE_TABLE_USERS,
} from '~/modules/user/infrastructure/supabaseUserRepository'
import { createEffect, createSignal } from 'solid-js'
import { showPromise } from '~/modules/toast/application/toastManager'
import { handleApiError } from '~/shared/error/errorHandler'
import { registerSubapabaseRealtimeCallback } from '~/legacy/utils/supabase'

export const DEFAULT_USER_ID = 3

const userRepository = createSupabaseUserRepository()

export const [users, setUsers] = createSignal<readonly User[]>([])

export const [currentUser, setCurrentUser] = createSignal<User | null>(null)

export const [currentUserId, setCurrentUserId] = createSignal<number>(1)

createEffect(() => {
  if (currentUserId() !== null) {
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
  }
})

function bootstrap() {
  fetchUsers().catch((error) => {
    handleApiError(error, {
      component: 'userApplication',
      operation: 'bootstrap',
      additionalData: {},
    })
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

export async function fetchUsers(): Promise<void> {
  const users = await userRepository.fetchUsers()
  const newCurrentUser = users.find((user) => user.id === currentUserId())
  setUsers(users)
  setCurrentUser(newCurrentUser ?? null)
}

export async function fetchCurrentUser(): Promise<User | null> {
  const user = await userRepository.fetchUser(currentUserId())
  setCurrentUser(user)
  return user
}

export async function insertUser(newUser: NewUser): Promise<void> {
  try {
    await showPromise(userRepository.insertUser(newUser), {
      loading: 'Inserindo usuário...',
      success: 'Usuário inserido com sucesso',
      error: 'Falha ao inserir usuário',
    })
    await fetchUsers()
  } catch (error) {
    handleApiError(error, {
      component: 'userApplication',
      operation: 'insertUser',
      additionalData: { newUser },
    })
    throw error
  }
}

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
      { context: 'user-action' },
    )
    await fetchUsers()
    return user
  } catch (error) {
    handleApiError(error, {
      component: 'userApplication',
      operation: 'updateUser',
      additionalData: { userId, newUser },
    })
    throw error
  }
}

export async function deleteUser(userId: User['id']): Promise<void> {
  try {
    await showPromise(
      userRepository.deleteUser(userId),
      {
        loading: 'Removendo usuário...',
        success: 'Usuário removido com sucesso',
        error: 'Falha ao remover usuário',
      },
      { context: 'user-action' },
    )
    await fetchUsers()
  } catch (error) {
    handleApiError(error, {
      component: 'userApplication',
      operation: 'deleteUser',
      additionalData: { userId },
    })
    throw error
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
    throw new Error('User not initialized')
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

  updateUser(currentUser_.id, {
    ...demoteToNewUser(currentUser_),
    favorite_foods: favoriteFoods,
  })
    .then(fetchCurrentUser)
    .catch((error) => {
      handleApiError(error, {
        component: 'userApplication',
        operation: 'toggleFavoriteFood',
        additionalData: { foodId, favorite },
      })
    })
}
