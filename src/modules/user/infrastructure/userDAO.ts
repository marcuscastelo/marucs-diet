import { z } from 'zod'
import { type User, type NewUser, userSchema } from '~/modules/user/domain/user'

// DAO schemas for database operations
export const createUserDAOSchema = z.object({
  name: z.string(),
  favorite_foods: z.array(z.number()).nullable(),
  diet: z.enum(['cut', 'normo', 'bulk']),
  birthdate: z.string(),
  gender: z.union([z.literal('male'), z.literal('female')]),
  desired_weight: z.number(),
})

export const userDAOSchema = createUserDAOSchema.extend({
  id: z.number(),
})

export type CreateUserDAO = z.infer<typeof createUserDAOSchema>
export type UserDAO = z.infer<typeof userDAOSchema>

// Conversion functions
export function createInsertUserDAOFromNewUser(newUser: NewUser): CreateUserDAO {
  return {
    name: newUser.name,
    favorite_foods: newUser.favorite_foods,
    diet: newUser.diet,
    birthdate: newUser.birthdate,
    gender: newUser.gender,
    desired_weight: newUser.desired_weight,
  }
}

export function createUpdateUserDAOFromNewUser(newUser: NewUser): CreateUserDAO {
  return createInsertUserDAOFromNewUser(newUser)
}

export function createUserFromDAO(dao: UserDAO): User {
  return userSchema.parse({
    id: dao.id,
    name: dao.name,
    favorite_foods: dao.favorite_foods ?? [],
    diet: dao.diet,
    birthdate: dao.birthdate,
    gender: dao.gender,
    desired_weight: dao.desired_weight,
  })
}
