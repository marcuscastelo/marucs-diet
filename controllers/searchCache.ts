import { Food } from '@/model/foodModel';
import { Record } from 'pocketbase';

import { CachedSearch, cachedSearchSchema } from '@/model/cachedSearch';
import supabase from '@/utils/supabase';

const TABLE = 'cached_searches';

export const isCached = async (search: string) => {
    // TODO: tratar erros e fazer o filtro na query
    const cached = ((await supabase.from(TABLE).select('*')).data ?? []).map((data) => cachedSearchSchema.parse(data));
    return cached.some((cache) => cache.search.toLowerCase() === search.toLowerCase());
}

export const markAsCached = async (search: string) => {
    if (await isCached(search)) {
        return;
    }
    await supabase.from(TABLE).upsert({ search }).select();
}

export const removeFromCache = async (search: string) => {
    // const cached = (await listAll<CachedSearch>(TABLE)).map((data) => cachedSearchSchema.parse(data));
    // const toDelete = cached.find((cache) => cache.search.toLowerCase() === search.toLowerCase());
    // if (toDelete) {
    //     await pb.collection(TABLE).delete(toDelete.id, { $autoCancel: false });
    // } else {
    //     throw new Error(`Search ${search} not found in cache, cannot delete`);
    // }
}