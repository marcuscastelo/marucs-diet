import { z } from 'zod'

export const userSchema = z.object({
  id: z.number({ required_error: 'User ID is required' }),
  name: z.string({ required_error: 'Name is required' }),
  favorite_foods: z
    .array(
      z.number({
        required_error: 'Favorite food item is required',
        invalid_type_error: 'Favorite food item must be an integer',
      }),
      {
        required_error: 'Favorite food items are required',
        invalid_type_error: 'Favorite food items must be an array',
      },
    )
    .nullable()
    .transform((value) => value ?? []),
  diet: z.enum(['cut', 'normo', 'bulk'], {
    required_error: 'Diet is required',
    invalid_type_error: 'Diet must be one of these strings: [cut, normo, bulk]',
  }),
  birthdate: z.string({
    required_error: 'Birthdate is required',
    invalid_type_error: 'Birthdate must be a string',
  }),
  gender: z.union([z.literal('male'), z.literal('female')]),
  desired_weight: z.number({
    required_error: 'Desired weight is required',
    invalid_type_error: 'Desired weight must be a number',
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
  return newUserSchema.parse({
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
  return userSchema.parse({
    ...newUser,
    id,
  })
}

/**
 * Demotes a User to a NewUser for updates.
 * Used when converting a persisted User back to NewUser for database operations.
 */
export function demoteToNewUser(user: User): NewUser {
  return newUserSchema.parse({
    name: user.name,
    favorite_foods: user.favorite_foods,
    diet: user.diet,
    birthdate: user.birthdate,
    gender: user.gender,
    desired_weight: user.desired_weight,
    __type: 'NewUser',
  })
}
