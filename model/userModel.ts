import { z } from "zod";

export const userSchema = z.object({
    id: z.string({ required_error: 'User ID is required' }),
    name: z.string({ required_error: 'Name is required' }),
    favoriteFoods: z.array(
        z.string({ required_error: 'Favorite food is required', invalid_type_error: 'Favorite food must be a string' }),
        { required_error: 'Favorite foods is required', invalid_type_error: 'Favorite foods must be an array' }
    ),
});

export type User = z.infer<typeof userSchema>;