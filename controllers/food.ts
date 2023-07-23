import { Food } from '@/model/foodModel';
import { Record } from 'pocketbase';
import { z } from 'zod';

import pb from '@/utils/pocketBase';
import { parallelLimit } from 'async';
import { listAll } from './utils';
import axios from 'axios';
import { NewFood, newFoodSchema } from '@/model/newFoodModel';
import { addToCache, isCached } from './searchCache';

const PB_COLLECTION = 'Food';

function hackConvert(food: NewFood): Omit<Food, 'id'> {
    return {
        name: food.nome,
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
        console.log('Cache found, returning cached foods...');
        return await ifCached();
    }

    console.log('Cache not found, fetching from API...');
    const newFoods = await ifNotCached();
    const createdFoodsPromises = newFoods.map(async (food, idx) => {
        console.log(`Caching ${idx + 1}/${newFoods.length}... (${food.name})`)
        return await createFood(food);
    });

    try {
        const createdFoods = await Promise.all(createdFoodsPromises);
        console.log('Finished caching foods.');
        console.log(`Marking '${cacheKey}' as cached...`);
        await addToCache(cacheKey);
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
    alimentos: z.array(newFoodSchema, { required_error: 'Foods is required' })
});
        

export const listFoods = async () => {
    console.log('Listing foods...');

    return await internalCacheLogic('__root__',
        {
            ifCached: async () => await listAll<Food>(PB_COLLECTION),
            ifNotCached: 
                async () => {
                    const newFoods = newFoodsSchema.parse((await axios.get(`http://192.168.0.14:3000/api/food`)).data);
                    const convertedFoods = newFoods.alimentos.map(hackConvert);
                    return convertedFoods;
                }
        }
    );
}

export const searchFoods = async (search: string) => {
    const newFoods = newFoodsSchema.parse((await axios.get(`http://192.168.0.14:3000/api/food/${search}`)).data);
    return newFoods.alimentos.map(hackConvert);
}

export const createFood = async (food: Omit<Food, 'id'>) => await pb.collection(PB_COLLECTION).create(food, { $autoCancel: false }) as (Record & Food);

export const deleteAll = async () => {
    const foods = await listFoods();
    console.log(`Deleting ${foods.length} foods...`);
    const actions = foods.map((food) => async () => {
        while (true) {
            try {
                await pb.collection(PB_COLLECTION).delete(food.id, { $autoCancel: false })
                break;
            } catch (e) {
                console.error(e);
                console.log(`Retrying ${food.name}...`);
                await new Promise(r => setTimeout(r, 1000));
            }
        }
    })
    await parallelLimit(actions, 10);
    console.log('Finished deleting foods.');

}