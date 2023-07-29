import { Record } from 'pocketbase';

import { Day, daySchema } from '@/model/dayModel';
import { listAll } from './utils';
import { User } from '@/model/userModel';
import supabase from '@/utils/supabase';

const TABLE = 'days';

export const listDays = async (userId: User['id']): Promise<Day[]> =>
    ((await supabase.from(TABLE).select('*')).data ?? [])
        .map(day => daySchema.parse(day))
        .filter((day) => day.owner === userId)
        .map((day): Day => ({
            ...day,
            target_day: day.target_day.split(' ')[0],
        }));

export const createDay = async (day: Day) => {
    // return await pb.collection(TABLE).create<Record & DayData>(day, { $autoCancel: false });
}

export const updateDay = async (id: Day['id'], day: Day) => {
    // return await pb.collection(TABLE).update<Record & DayData>(id, day, { $autoCancel: false });
}

//TODO: add boolean to check on usages of this function
export const deleteDay = async (id: Day['id']) => {
    // return await pb.collection(TABLE).delete(id, { $autoCancel: false });
}
