import { Record } from 'pocketbase';

import pb from '@/utils/pocketBase';
import { parallelLimit } from 'async';
import { DayData } from '@/model/dayModel';

export const listDays = async () => {
    const first = await pb.collection('Days').getList(undefined, 1000, { $autoCancel: false });

    const totalPages = first.totalPages;

    const rest = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) => i + 2).map((page) =>
            pb.collection('Days').getList(page, 1000, { $autoCancel: false, $page: page })
        )
    );

    const items = first.items.concat(...rest.map((r) => r.items));
    const onlyDates = items.map((item) => ({
        ...item,
        targetDay: item.targetDay.split(' ')[0],
    }));
    
    return onlyDates as (Record & DayData)[];
}

export const createDay = async (day: DayData) => {
    return pb.collection('Days').create(day, { $autoCancel: false }) as Promise<Record & DayData>;
}

export const updateDay = async (id:string, day: DayData) => {
    return pb.collection('Days').update(id, day, { $autoCancel: false }) as Promise<Record & DayData>;
}