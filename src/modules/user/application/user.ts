import { User } from '@/modules/user/domain/user'
import { createSupabaseUserRepository } from '@/modules/user/infrastructure/supabaseUserRepository'
import { computed, signal } from '@preact/signals-react'

export const DEFAULT_USER_ID = 3

const userRepository = createSupabaseUserRepository()

const users_ = signal<readonly User[]>([])
const currentUser_ = signal<User | null>({
  id: DEFAULT_USER_ID,
  name: 'Default User',
  birthdate: '1990-01-01',
  desired_weight: 70,
  diet: 'normo',
  favorite_foods: [],
  gender: 'male',
})

export const users = computed(() => users_.value)
export const currentUser = computed(() => currentUser_.value)

export const currentUserId = signal<number | null>(3)

export async function fetchUsers(): Promise<void> {
  const users = await userRepository.fetchUsers()
  users_.value = users
}

export async function fetchCurrentUser(): Promise<User | null> {
  if (currentUserId.value === null) {
    throw new Error('User not initialized')
  }
  const user = await userRepository.fetchUser(currentUserId.value)
  currentUser_.value = user
  return user
}

export async function insertUser(newUser: User): Promise<void> {
  const user = await userRepository.insertUser(newUser)
  fetchUsers()
}

export async function updateUser(
  userId: User['id'],
  newUser: User,
): Promise<User> {
  const user = await userRepository.updateUser(userId, newUser)
  fetchUsers()
  return user
}

export async function deleteUser(userId: User['id']): Promise<void> {
  await userRepository.deleteUser(userId)
  fetchUsers()
}

export function initializeUser(): void {
  // if (currentUserId.value !== null) {
  //   throw new Error('User already initialized')
  // }
  // const userId = loadUserIdFromLocalStorage()
  // if (userId === null) {
  //   changeToUser(DEFAULT_USER_ID)
  // } else {
  //   changeToUser(userId)
  // }
}

export function changeToUser(userId: User['id']): void {
  // currentUserId.value = userId
  // saveUserIdToLocalStorage(userId)
}

// TODO: Create module for favorites
export function isFoodFavorite(foodId: number): boolean {
  return currentUser.value?.favorite_foods.includes(foodId) ?? false
}

export function setFoodAsFavorite(foodId: number, isFavorite: boolean): void {
  // if (currentUser.value === null) {
  //   throw new Error('User not initialized')
  // }
  // const favoriteFoods = currentUser.value.favorite_foods
  // if (isFavorite) {
  //   if (!favoriteFoods.includes(foodId)) {
  //     favoriteFoods.push(foodId)
  //   }
  // } else {
  //   const index = favoriteFoods.indexOf(foodId)
  //   if (index !== -1) {
  //     favoriteFoods.splice(index, 1)
  //   }
  // }
  // updateUser(currentUser.value.id, {
  //   ...currentUser.value,
  //   favorite_foods: favoriteFoods,
  // })
}
