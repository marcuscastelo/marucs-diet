import { type NewUser, type User } from '~/modules/user/domain/user'

export type UserRepository = {
  fetchUsers: () => Promise<readonly User[]>
  fetchUser: (userId: User['id']) => Promise<User | null>
  insertUser: (newUser: NewUser) => Promise<User | null>
  updateUser: (userId: User['id'], newUser: NewUser) => Promise<User | null>
  deleteUser: (userId: User['id']) => Promise<void>
}
