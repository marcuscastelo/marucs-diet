import supabase from '@/utils/supabase';
import { CachedEan, cachedEanSchema } from '@/model/cachedEan';

const TABLE = 'cached_eans';

export const isEanCached = async (ean: CachedEan['ean']) => {
    // TODO: retriggered: tratar erros e fazer o filtro na query
    const cached = ((await supabase.from(TABLE).select()).data ?? []).map((data) => cachedEanSchema.parse(data));
    return cached.some((cache) => cache.ean.toLowerCase() === ean.toLowerCase());
}

export const markEanAsCached = async (search: CachedEan['ean']) => {
    if (await isEanCached(search)) {
        return;
    }
    await supabase.from(TABLE).upsert({ search: search.toLowerCase() }).select();
}

export const unmarkEanAsCached = async (search: CachedEan['ean']) => {
    await supabase.from(TABLE).delete().match({ search }).select();
}