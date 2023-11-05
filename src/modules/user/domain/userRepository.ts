import { type User } from '@/modules/user/domain/user'
import { type DbReady } from '@/legacy/utils/newDbRecord'

export type UserRepository = {
  fetchUsers: () => Promise<readonly User[]>
  fetchUser: (userId: User['id']) => Promise<User | null>
  insertUser: (newUser: DbReady<User>) => Promise<User>
  updateUser: (userId: User['id'], newUser: DbReady<User>) => Promise<User>
  deleteUser: (userId: User['id']) => Promise<void>
}
