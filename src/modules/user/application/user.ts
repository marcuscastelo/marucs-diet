import { User } from '@/src/modules/user/domain/user'
import { createSupabaseUserRepository } from '@/src/modules/user/infrastructure/supabaseUserRepository'
// import { computed, signal } from '@preact/signals-react'

function signal<T>(a: T) {
  return { value: a }
}

function computed<R, T extends (...params: any) => R>(a: T) {
  return { value: a() } as { value: ReturnType<T> }
}

export const DEFAULT_USER_ID = 3

const userRepository = createSupabaseUserRepository()

const users_ = signal<readonly User[]>([])
const currentUser_ = signal<User | null>(null)

export const users = computed(() => users_.value)
export const currentUser = computed(() => currentUser_.value)

export const currentUserId = signal<number | null>(null)

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
