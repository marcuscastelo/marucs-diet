import { Food, foodSchema } from '@/model/foodModel';
import { Record } from 'pocketbase';
import { z } from 'zod';

import { ApiFood, apiFoodSchema } from '@/model/apiFoodModel';
import { markAsCached, isCached } from './searchCache';
import { INTERNAL_API } from '@/utils/api';
import supabase from '@/utils/supabase';

const TABLE = 'foods';

//TODO: retriggered: pensar num lugar melhor pra isso
export function convertApi2Food(food: ApiFood): Omit<Food, 'id'> {
    return {
        name: food.nome,
        source: {
            type: 'api',
            id: food.id.toString(),
        },
        macros: {
            calories: food.calorias * 100,
            carbs: food.carboidratos * 100,
            protein: food.proteinas * 100,
            fat: food.gordura * 100,
        }
    };
}

const internalCacheLogic = async (
    cacheKey: string,
    { ifCached, ifNotCached }: {
        ifCached: () => Promise<Food[]>,
        ifNotCached: () => Promise<Omit<Food, 'id'>[]>
    }
): Promise<Food[]> => {
    console.log('Checking cache...');
    if (await isCached(cacheKey)) {
        console.log('Cache found, returning cached foods...'); //TODO: retriggered: fix cached foods being limited to top 1000
        return await ifCached();
    }

    console.log('Cache not found, fetching from API...');
    const newFoods = await ifNotCached();
    const createdFoodsPromises = newFoods.map(async (food, idx) => {
        console.log(`Caching ${idx + 1}/${newFoods.length}... (${food.name})`)
        return await upsertFood(food);
    });

    try {
        const createdFoods = await Promise.all(createdFoodsPromises);
        console.log('Finished caching foods.');
        console.log(`Marking '${cacheKey}' as cached...`);
        await markAsCached(cacheKey);
        console.log('Finished marking cache as cached.');

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

    return await internalCacheLogic('__root__',
        {
            ifCached: async (): Promise<Food[]> => {
                const { data, error } = await supabase.from(TABLE).select('*');
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

export const searchFoods = async (search: string, limit?: number) => {
    console.log(`Searching for '${search}'...`);

    return await internalCacheLogic(search,
        {
            //TODO: retriggered: remover duplicação de código e usar a busca do supabase
            ifCached: async (): Promise<Food[]> => {
                const { data, error } = await supabase.from(TABLE).select('*');
                console.log(`Got ${data?.length} foods from cache.`)
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
                            q: search,
                        }
                    })).data);
                    const convertedFoods = newFoods.alimentos.map(convertApi2Food);
                    return convertedFoods;
                }
        }
    );
}

export const upsertFood = async (food: Omit<Food, 'id'>): Promise<Food> => {
    const { data, error } = await supabase.from(TABLE).upsert(food).select('*');
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