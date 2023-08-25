import { z } from 'zod'

export const userSchema = z.object({
  id: z.number({ required_error: 'User ID is required' }),
  name: z.string({ required_error: 'Name is required' }),
  favorite_foods: z
    .array(
      z.number({
        required_error: 'Favorite food is required',
        invalid_type_error: 'Favorite food must be an integer',
      }),
      {
        required_error: 'Favorite foods is required',
        invalid_type_error: 'Favorite foods must be an array',
      },
    )
    .nullable()
    .transform((value) => value ?? []),
  height: z.number({
    required_error: 'Height is required',
    invalid_type_error: 'Height must be a number',
  }),
  diet: z.enum(['cut', 'normo', 'bulk'], {
    required_error: 'Diet is required',
    invalid_type_error: 'Diet must be one of these strings: [cut, normo, bulk]',
  }),
  birthdate: z.string({
    required_error: 'Birthdate is required',
    invalid_type_error: 'Birthdate must be a string',
  }),
  macro_profile: z
    .object(
      {
        gramsPerKgCarbs: z.number({
          required_error: 'Grams per kg of carbs is required',
          invalid_type_error: 'Grams per kg of carbs must be a number',
        }),
        gramsPerKgProtein: z.number({
          required_error: 'Grams per kg of protein is required',
          invalid_type_error: 'Grams per kg of protein must be a number',
        }),
        gramsPerKgFat: z.number({
          required_error: 'Grams per kg of fat is required',
          invalid_type_error: 'Grams per kg of fat must be a number',
        }),
      },
      {
        required_error: 'Macro profile is required',
        invalid_type_error: 'Macro profile must be an object',
      },
    )
    .nullable()
    .transform(
      (value) =>
        value ?? { gramsPerKgCarbs: 2, gramsPerKgProtein: 2, gramsPerKgFat: 1 },
    ),
})

export type User = z.infer<typeof userSchema>
