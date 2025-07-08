import { z } from 'zod/v4'

import { createZodEntity } from '~/shared/domain/validationMessages'

const ze = createZodEntity('user')

export const {
  schema: userSchema,
  newSchema: newUserSchema,
  createNew: createNewUser,
  promote: promoteNewUserToUser,
  demote: demoteUserToNewUser,
} = ze.create({
  id: ze.number(),
  name: ze.string(),
  favorite_foods: ze
    .array(ze.number())
    .nullable()
    .transform((value) => value ?? []),
  diet: z.enum(['cut', 'normo', 'bulk']),
  birthdate: ze.string(),
  gender: z.union([z.literal('male'), z.literal('female')]),
  desired_weight: ze.number(),
})

export type NewUser = Readonly<z.infer<typeof newUserSchema>>
export type User = Readonly<z.infer<typeof userSchema>>
