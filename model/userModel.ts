import { z } from "zod";

export const userSchema = z.object({
    id: z.string({ required_error: 'User ID is required' }),
    name: z.string({ required_error: 'Name is required' }),
    favoriteFoods: z.array(
        z.string({ required_error: 'Favorite food is required', invalid_type_error: 'Favorite food must be a string' }),
        { required_error: 'Favorite foods is required', invalid_type_error: 'Favorite foods must be an array' }
    ),
    weight: z.number({ required_error: 'Weight is required', invalid_type_error: 'Weight must be a number' }),
    macroProfile: z.object({
        gramsPerKgCarbs: z.number({ required_error: 'Grams per kg of carbs is required', invalid_type_error: 'Grams per kg of carbs must be a number' }),
        gramsPerKgProtein: z.number({ required_error: 'Grams per kg of protein is required', invalid_type_error: 'Grams per kg of protein must be a number' }),
        gramsPerKgFat: z.number({ required_error: 'Grams per kg of fat is required', invalid_type_error: 'Grams per kg of fat must be a number' }),
    }, { required_error: 'Macro profile is required', invalid_type_error: 'Macro profile must be an object' })
    .nullable()
    .transform((value) => value ?? { gramsPerKgCarbs: 2, gramsPerKgProtein: 2, gramsPerKgFat: 1 })
});

export type User = z.infer<typeof userSchema>;