import { Food, foodSchema } from '@/model/foodModel';
import { Record } from 'pocketbase';
import { z } from 'zod';

import { ApiFood, apiFoodSchema } from '@/model/apiFoodModel';
import { markSearchAsCached, isSearchCached, unmarkSearchAsCached } from './searchCache';
import { INTERNAL_API } from '@/utils/api';
import supabase from '@/utils/supabase';
import { isEanCached } from './eanCache';

const TABLE = 'foods';

//TODO: retriggered: pensar num lugar melhor pra isso
export function convertApi2Food(food: ApiFood): Omit<Food, 'id'> {
    return {
        name: food.nome,
        source: {
            type: 'api',
            id: food.id.toString(),
        },
        ean: food.ean,
        macros: {
            calories: food.calorias * 100,
            carbs: food.carboidratos * 100,
            protein: food.proteinas * 100,
            fat: food.gordura * 100,
        }
    };
}

const internalSearchCacheLogic = async (
    cacheKey: string,
    checkCached: (cacheKey: string) => Promise<boolean>,
    { ifCached, ifNotCached }: {
        ifCached: () => Promise<Food[]>,
        ifNotCached: () => Promise<Omit<Food, 'id'>[]>
    }
): Promise<Food[]> => {
    console.log('Checking cache...');
    if (await checkCached(cacheKey)) {
        console.log('Cache found, returning cached foods...'); //TODO: retriggered: fix cached foods being limited to top 1000
        return await ifCached();
    }

    console.log('Cache not found, fetching from API...');
    const newFoods = await ifNotCached();
    const createdFoodsPromises = newFoods.map(async (food, idx) => {
        console.log(`Creating ${idx + 1}/${newFoods.length}... (${food.name})`)
        return await upsertFood(food);
    });

    try {
        const createdFoods = await Promise.all(createdFoodsPromises);
        console.log('Finished creating foods.');
        if (createdFoods.length === 0) {
            console.warn('No foods created!! skipping cache');
        } else {
            console.log(`Marking '${cacheKey}' as cached...`);
            await markSearchAsCached(cacheKey);
            console.log('Finished marking cache as cached.');
        }

        return createdFoods;
    }
    catch (e) {
        console.error(e);
        console.log('Failed to cache foods!!');
        return [];
    }
}

const newFoodsSchema = z.object({
    alimentos: z.array(apiFoodSchema, { required_error: 'Foods is required' })
});

export const listFoods = async (limit?: number) => {
    console.log('Listing foods...');

    return await internalSearchCacheLogic('__root__', isSearchCached,
        {
            ifCached: async (): Promise<Food[]> => {
                const { data, error } = await supabase.from(TABLE).select().limit(limit ?? 100);
                console.log(`Got ${data?.length} foods from cache.`)
                if (error) {
                    console.error(error);
                    throw error;
                }
                return (data ?? []).map(food => foodSchema.parse(food));
            },
            ifNotCached:
                async () => {
                    const newFoods = newFoodsSchema.parse((await INTERNAL_API.get(`food`)).data);
                    const convertedFoods = newFoods.alimentos.map(convertApi2Food);
                    return convertedFoods;
                }
        }
    );
}

export const searchFoodsByName = async (name: string, limit?: number) => {
    console.log(`Searching for name = '${name}'...`);

    return await internalSearchCacheLogic(name, isSearchCached,
        {
            ifCached: async (): Promise<Food[]> => {
                const { data, error } = await supabase.from(TABLE).select().ilike('name', `%${name}%`).limit(limit ?? 100);
                console.log(`Got ${data?.length} foods from cache.`);
                if (data?.length === 0) {
                    //TODO: readd this logic of cache invalidation, but also with time
                    // console.log('No foods found, unmarking cache as cached.');
                    // await unmarkAsCached(search);
                }

                if (error) {
                    console.error(error);
                    throw error;
                }
                return (data ?? []).map(food => foodSchema.parse(food));
            },
            ifNotCached:
                async () => {
                    const newFoods = newFoodsSchema.parse((await await INTERNAL_API.get('food', {
                        params: {
                            q: name,
                        }
                    })).data);
                    const convertedFoods = newFoods.alimentos.map(convertApi2Food);
                    return convertedFoods;
                }
        }
    );
}

export const searchFoodsByEan = async (ean: string, limit?: number): Promise<Food> => {
    console.log(`Searching for ean = '${ean}'...`);

    //TODO: Rewrite this code together with the entire
    return foodSchema.parse((await internalSearchCacheLogic(ean, isEanCached,
        {
            ifCached: async (): Promise<Food[]> => {
                const { data, error } = await supabase.from(TABLE).select().ilike('ean', `%${ean}%`).limit(limit ?? 100);
                console.log(`Got ${data?.length} foods from cache.`);
                if (data?.length === 0) {
                    //TODO: readd this logic of cache invalidation, but also with time
                    // console.log('No foods found, unmarking cache as cached.');
                    // await unmarkAsCached(search);
                }

                if (error) {
                    console.error(error);
                    throw error;
                }
                return (data ?? []).map(food => foodSchema.parse(food));
            },
            ifNotCached:
                async () => {
                    const newFoods = newFoodsSchema.parse((await await INTERNAL_API.get('barcode', {
                        params: {
                            q: ean,
                        }
                    })).data);
                    const convertedFoods = newFoods.alimentos.map(convertApi2Food);
                    return convertedFoods;
                }
        }
    )).find(food => food.ean === ean));
}

export const upsertFood = async (food: Omit<Food, 'id'>): Promise<Food> => {

    const { data, error } = await supabase.from(TABLE).upsert(food).select();
    if (error) {
        console.error(error);
        throw error;
    }
    return foodSchema.parse(data?.[0]);
}

export const deleteAll = async () => {
    // const foods = await listFoods();
    // console.log(`Deleting ${foods.length} foods...`);
    // const actions = foods.map((food) => async () => {
    //     while (true) {
    //         try {
    //             await pb.collection(PB_COLLECTION).delete(food.id, { $autoCancel: false })
    //             break;
    //         } catch (e) {
    //             console.error(e);
    //             console.log(`Retrying ${food.name}...`);
    //             await new Promise(r => setTimeout(r, 1000));
    //         }
    //     }
    // })
    // await parallelLimit(actions, 10);
    // console.log('Finished deleting foods.');

}