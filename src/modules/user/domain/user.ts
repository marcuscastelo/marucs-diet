import { z } from 'zod'

import {
  createCreatedAtField,
  createDescriptionField,
  createIdField,
  createNameField,
  createNewTypeField,
  createTypeField,
  createUpdatedAtField,
  createUserIdField,
} from '~/shared/domain/schema/baseSchemas'
import {
  createNumberField,
  createStringField,
} from '~/shared/domain/schema/validationMessages'
import { parseWithStack } from '~/shared/utils/parseWithStack'

export const userSchema = z
  .object({
    id: createIdField(),
    userId: createUserIdField(),
    name: createNameField(),
    description: createDescriptionField(),
    createdAt: createCreatedAtField(),
    updatedAt: createUpdatedAtField(),
    favorite_foods: z
      .array(createNumberField('id'))
      .nullable()
      .transform((value) => value ?? []),
    diet: z.enum(['cut', 'normo', 'bulk'], {
      required_error: "O campo 'diet' do usuário é obrigatório.",
      invalid_type_error:
        "O campo 'diet' do usuário deve ser 'cut', 'normo' ou 'bulk'.",
    }),
    birthdate: createStringField('birthdate'),
    gender: z.union([z.literal('male'), z.literal('female')]),
    desired_weight: createNumberField('desired_weight'),
    __type: createTypeField('User'),
  })
  .strip()

export const newUserSchema = userSchema
  .omit({ id: true })
  .extend({
    __type: createNewTypeField('NewUser'),
  })
  .strip()

export type NewUser = Readonly<z.infer<typeof newUserSchema>>
export type User = Readonly<z.infer<typeof userSchema>>

export function createNewUser({
  userId,
  name,
  description = null,
  favoriteFoods,
  diet,
  birthdate,
  gender,
  desiredWeight,
}: {
  userId: number
  name: string
  description?: string | null
  favoriteFoods?: number[] | null
  diet: 'cut' | 'normo' | 'bulk'
  birthdate: string
  gender: 'male' | 'female'
  desiredWeight: number
}): NewUser {
  const now = new Date()
  return parseWithStack(newUserSchema, {
    userId,
    name,
    description,
    favorite_foods: favoriteFoods ?? [],
    diet,
    birthdate,
    gender,
    desired_weight: desiredWeight,
    createdAt: now,
    updatedAt: now,
    __type: 'new-NewUser',
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
