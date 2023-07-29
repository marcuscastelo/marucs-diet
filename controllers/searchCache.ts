import { Food } from '@/model/foodModel';
import { Record } from 'pocketbase';

import { CachedSearch, cachedSearchSchema } from '@/model/cachedSearch';
import supabase from '@/utils/supabase';

const TABLE = 'cached_searches';

export const isCached = async (search: string) => {
    // TODO: retriggered: tratar erros e fazer o filtro na query
    const cached = ((await supabase.from(TABLE).select()).data ?? []).map((data) => cachedSearchSchema.parse(data));
    return cached.some((cache) => cache.search.toLowerCase() === search.toLowerCase());
}

export const markAsCached = async (search: string) => {
    if (await isCached(search)) {
        return;
    }
    await supabase.from(TABLE).upsert({ search: search.toLowerCase() }).select();
}

export const unmarkAsCached = async (search: string) => {
    await supabase.from(TABLE).delete().match({ search }).select();
}