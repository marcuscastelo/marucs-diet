import { type User } from '@/modules/user/domain/user'
import {
  loadUserIdFromLocalStorage,
  saveUserIdToLocalStorage,
} from '@/modules/user/infrastructure/localStorageUserRepository'
import { createSupabaseUserRepository } from '@/modules/user/infrastructure/supabaseUserRepository'
import { createEffect, createSignal } from 'solid-js'

export const DEFAULT_USER_ID = 3

const userRepository = createSupabaseUserRepository()

export const [users, setUsers] = createSignal<readonly User[]>([])
export const [currentUser, setCurrentUser] = createSignal<User | null>(null)

export const [currentUserId, setCurrentUserId] = createSignal<number>(
  loadUserIdFromLocalStorage(),
)

createEffect(() => {
  if (currentUserId() !== null) {
    fetchCurrentUser().catch(console.error)
  }
})

export async function fetchUsers(): Promise<void> {
  const users = await userRepository.fetchUsers()
  setUsers(users)
}

export async function fetchCurrentUser(): Promise<User | null> {
  const user = await userRepository.fetchUser(currentUserId())
  setCurrentUser(user)
  return user
}

export async function insertUser(newUser: User): Promise<void> {
  await userRepository.insertUser(newUser)
  await fetchUsers()
}

export async function updateUser(
  userId: User['id'],
  newUser: User,
): Promise<User> {
  const user = await userRepository.updateUser(userId, newUser)
  await fetchUsers()
  return user
}

export async function deleteUser(userId: User['id']): Promise<void> {
  await userRepository.deleteUser(userId)
  await fetchUsers()
}

export function changeToUser(userId: User['id']): void {
  setCurrentUserId(userId)
  saveUserIdToLocalStorage(userId)
}

// TODO: Create module for favorites
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
    ...currentUser_,
    favorite_foods: favoriteFoods,
  })
    .then(fetchCurrentUser)
    .catch(console.error)
}
