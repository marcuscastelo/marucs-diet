import { Food } from '@/model/foodModel';
import { Record } from 'pocketbase';

import { listAll } from './utils';
import { CachedSearch, cachedSearchSchema } from '@/model/cachedSearch';
import pb from '@/utils/pocketBase';

const PB_COLLECTION = 'CachedSearch';

export const isCached = async (search: string) => {
    const cached = (await listAll<CachedSearch>(PB_COLLECTION)).map((data) => cachedSearchSchema.parse(data));
    return cached.some((cache) => cache.search.toLowerCase() === search.toLowerCase());
}

export const addToCache = async (search: string) => {
    if (await isCached(search)) {
        return;
    }
    await pb.collection(PB_COLLECTION).create({ search }, { $autoCancel: false });
}

export const removeFromCache = async (search: string) => {
    const cached = (await listAll<CachedSearch>(PB_COLLECTION)).map((data) => cachedSearchSchema.parse(data));
    const toDelete = cached.find((cache) => cache.search.toLowerCase() === search.toLowerCase());
    if (toDelete) {
        await pb.collection(PB_COLLECTION).delete(toDelete.id, { $autoCancel: false });
    } else {
        throw new Error(`Search ${search} not found in cache, cannot delete`);
    }
}