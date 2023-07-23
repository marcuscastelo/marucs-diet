import { z } from "zod";

export const cachedSearchSchema = z.object({
    id: z.string({ required_error: 'ID is required' }),
    search: z.string({ required_error: 'Search is required' }),
});

export type CachedSearch = z.infer<typeof cachedSearchSchema>;