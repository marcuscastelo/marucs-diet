import { z } from 'zod/v4'

import {
  createArrayFieldMessages,
  createEnumFieldMessages,
  createNumberFieldMessages,
  createStringFieldMessages,
} from '~/shared/domain/validationMessages'
import { parseWithStack } from '~/shared/utils/parseWithStack'

export const userSchema = z.object({
  id: z.number(createNumberFieldMessages('id')('user')),
  name: z.string(createStringFieldMessages('name')('user')),
  favorite_foods: z
    .array(
      z.number(createNumberFieldMessages('favorite_foods')('user')),
      createArrayFieldMessages('favorite_foods')('user'),
    )
    .nullable()
    .transform((value) => value ?? []),
  diet: z.enum(
    ['cut', 'normo', 'bulk'],
    createEnumFieldMessages('diet')('user'),
  ),
  birthdate: z.string(createStringFieldMessages('birthdate')('user')),
  gender: z.union([z.literal('male'), z.literal('female')]),
  desired_weight: z.number(createNumberFieldMessages('desired_weight')('user')),
  __type: z
    .string()
    .nullable()
    .optional()
    .transform(() => 'User' as const),
})

export const newUserSchema = userSchema.omit({ id: true }).extend({
  __type: z.literal('NewUser'),
})

export type NewUser = Readonly<z.infer<typeof newUserSchema>>
export type User = Readonly<z.infer<typeof userSchema>>

export function createNewUser({
  name,
  favoriteFoods,
  diet,
  birthdate,
  gender,
  desiredWeight,
}: {
  name: string
  favoriteFoods?: number[] | null
  diet: 'cut' | 'normo' | 'bulk'
  birthdate: string
  gender: 'male' | 'female'
  desiredWeight: number
}): NewUser {
  return parseWithStack(newUserSchema, {
    name,
    favorite_foods: favoriteFoods ?? [],
    diet,
    birthdate,
    gender,
    desired_weight: desiredWeight,
    __type: 'NewUser',
  })
}

export function promoteToUser(newUser: NewUser, id: number): User {
  return parseWithStack(userSchema, {
    ...newUser,
    id,
  })
}

/**
 * Demotes a User to a NewUser for updates.
 * Used when converting a persisted User back to NewUser for database operations.
 */
export function demoteToNewUser(user: User): NewUser {
  return parseWithStack(newUserSchema, {
    name: user.name,
    favorite_foods: user.favorite_foods,
    diet: user.diet,
    birthdate: user.birthdate,
    gender: user.gender,
    desired_weight: user.desired_weight,
    __type: 'NewUser',
  })
}
