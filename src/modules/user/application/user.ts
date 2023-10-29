import { User } from '@/src/modules/user/domain/user'
import {
  loadUserIdFromLocalStorage,
  saveUserIdToLocalStorage,
} from '@/src/modules/user/infrastructure/localStorageUserRepository'
import { createSupabaseUserRepository } from '@/src/modules/user/infrastructure/supabaseUserRepository'
import { computed, signal } from '@preact/signals-react'

const userRepository = createSupabaseUserRepository()

const users_ = signal<readonly User[]>([])
const currentUser_ = signal<User | null>(null)

export const users = computed(() => users_.value)
export const currentUser = computed(() => currentUser_.value)

export const currentUserId = signal<number>(loadUserIdFromLocalStorage() ?? 3)

export async function fetchUsers(): Promise<void> {
  const users = await userRepository.fetchUsers()
  users_.value = users
}

export async function fetchUser(userId: User['id']): Promise<User | null> {
  const user = await userRepository.fetchUser(userId)
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

export function changeToUser(userId: User['id']): void {
  currentUserId.value = userId
  saveUserIdToLocalStorage(userId)
}
