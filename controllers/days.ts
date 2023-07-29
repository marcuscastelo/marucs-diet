import { Record } from 'pocketbase';

import { DayData } from '@/model/dayModel';
import { listAll } from './utils';
import { User } from '@/model/userModel';

const PB_COLLECTION = 'Days';

export const listDays = async (userId: User['id']) =>
    (await listAll<DayData>(PB_COLLECTION))
        .filter((day) => day.owner === userId)
        .map((day): DayData => ({
            ...day,
            targetDay: day.targetDay.split(' ')[0],
        }));

export const createDay = async (day: DayData) => {
    // return await pb.collection(PB_COLLECTION).create<Record & DayData>(day, { $autoCancel: false });
}

export const updateDay = async (id: DayData['id'], day: DayData) => {
    // return await pb.collection(PB_COLLECTION).update<Record & DayData>(id, day, { $autoCancel: false });
}

//TODO: add boolean to check on usages of this function
export const deleteDay = async (id: DayData['id']) => {
    // return await pb.collection(PB_COLLECTION).delete(id, { $autoCancel: false });
}
