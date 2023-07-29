import { Record } from 'pocketbase';

import { Day, daySchema } from '@/model/dayModel';
import { User } from '@/model/userModel';
import supabase from '@/utils/supabase';

const TABLE = 'days';

//TODO: tratar erros (também no resto dos controllers)
export const listDays = async (userId: User['id']): Promise<Day[]> =>
    ((await supabase.from(TABLE).select('*')).data ?? [])
        .map(day => daySchema.parse(day))
        .filter((day) => day.owner === userId)
        .map((day): Day => ({
            ...day,
            target_day: day.target_day.split(' ')[0],
        }));

export const upsertDay = async (day: Partial<Day> & Omit<Day, 'id'>): Promise<Day | null> => {
    const { data: days, error } = await supabase.
        from(TABLE)
        .upsert(day)
        .select('*');
    if (error) {
        throw error;
    }
    return daySchema.parse(days?.[0] ?? null);
}

export const updateDay = async (id: Day['id'], day: Day): Promise<Day> => {
    const { data, error } = await supabase
        .from(TABLE)
        .update(day)
        .eq('id', id)
        .select('*');

    if (error) {
        throw error;
    }

    return daySchema.parse(data?.[0] ?? null)
}

//TODO: add boolean to check on usages of this function
export const deleteDay = async (id: Day['id']): Promise<void> => {
    const { error } = await supabase
        .from(TABLE)
        .delete()
        .eq('id', id)
        .select('*');

    if (error) {
        throw error;
    }
}
