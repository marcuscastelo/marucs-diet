import { Record } from 'pocketbase';

import pb from '@/utils/pocketBase';
import { DayData } from '@/model/dayModel';
import { listAll } from './utils';
import { User } from '@/model/userModel';

const PB_COLLECTION = 'Days';

export const listDays = async (user: Record & User) =>
    (await listAll<DayData>(PB_COLLECTION))
        .filter((day) => day.owner === user.id)
        .map((day) => ({
            ...day,
            targetDay: day.targetDay.split(' ')[0],
        })) as (Record & DayData)[];

export const createDay = async (day: DayData) => {
    return pb.collection(PB_COLLECTION).create(day, { $autoCancel: false }) as Promise<Record & DayData>;
}

export const updateDay = async (id: string, day: DayData) => {
    return pb.collection(PB_COLLECTION).update(id, day, { $autoCancel: false }) as Promise<Record & DayData>;
}