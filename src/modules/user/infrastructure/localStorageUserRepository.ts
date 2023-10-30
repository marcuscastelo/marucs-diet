import { type User } from '@/modules/user/domain/user'

export function saveUserIdToLocalStorage (_userId: User['id']) {
  // localStorage.setItem('currentUserId', String(userId))
}

export function loadUserIdFromLocalStorage () {
  return 3
  // const userId = localStorage.getItem('currentUserId')
  // return userId !== null ? Number(userId) : null
}
