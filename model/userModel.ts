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
})

export type User = Readonly<z.infer<typeof userSchema>>
