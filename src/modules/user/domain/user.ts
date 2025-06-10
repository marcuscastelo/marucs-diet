import { z } from 'zod'

import { parseWithStack } from '~/shared/utils/parseWithStack'

export const userSchema = z.object({
  id: z.number({
    required_error: "O campo 'id' do usuário é obrigatório.",
    invalid_type_error: "O campo 'id' do usuário deve ser um número.",
  }),
  name: z.string({
    required_error: "O campo 'name' do usuário é obrigatório.",
    invalid_type_error: "O campo 'name' do usuário deve ser uma string.",
  }),
  favorite_foods: z
    .array(
      z.number({
        required_error: "O campo 'favorite_foods' do usuário é obrigatório.",
        invalid_type_error:
          "O campo 'favorite_foods' deve ser uma lista de números.",
      }),
    )
    .nullable()
    .transform((value) => value ?? []),
  diet: z.enum(['cut', 'normo', 'bulk'], {
    required_error: "O campo 'diet' do usuário é obrigatório.",
    invalid_type_error:
      "O campo 'diet' do usuário deve ser 'cut', 'normo' ou 'bulk'.",
  }),
  birthdate: z.string({
    required_error: "O campo 'birthdate' do usuário é obrigatório.",
    invalid_type_error: "O campo 'birthdate' do usuário deve ser uma string.",
  }),
  gender: z.union([z.literal('male'), z.literal('female')]),
  desired_weight: z.number({
    required_error: "O campo 'desired_weight' do usuário é obrigatório.",
    invalid_type_error:
      "O campo 'desired_weight' do usuário deve ser um número.",
  }),
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
