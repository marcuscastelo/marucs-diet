import { Food } from '@/model/foodModel';
import { Record } from 'pocketbase';

import pb from '@/utils/pocketBase';
import { parallelLimit } from 'async';
import { listAll } from './utils';
import axios from 'axios';
import { NewFoodData } from '@/model/newFoodModel';
import { addToCache, isCached } from './searchCache';

const PB_COLLECTION = 'Food';

function hackConvert(food: NewFoodData) : Omit<Food, 'id'> {
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

export const listFoods = async () => {
    console.log('Listing foods...');

    console.log('Checking cache...');
    if (await isCached('__root__')) {
        console.log('Cache found, returning cached foods...');
        return await listAll<Food>(PB_COLLECTION);
    }

    console.log('Cache not found, fetching from API...');
    const newFoods = (await axios.get(`http://192.168.0.14:3000/api/food`)).data as { alimentos: NewFoodData[] };
    const convertedFoods = newFoods.alimentos.map(hackConvert);

    const promises = convertedFoods.map(async (food, idx) => {
        console.log(`Caching ${idx + 1}/${convertedFoods.length}... (${food.name})`)
        return await createFood(food);
    });

    try {
        console.log('Starting cache...');
        const foods = (await Promise.all(promises));
        console.log('Finished caching foods.');
        console.log('Marking __root__ as cached...');
        await addToCache('__root__');
        console.log('Finished marking __root__ as cached.');
        return foods;
    } catch (e) {
        console.error(e);
        console.log('Failed to cache foods!!');
        return [];
    }
}

export const searchFoods = async (search: string) => {
    const newFoods = (await axios.get(`http://192.168.0.14:3000/api/food/${search}`)).data as { alimentos: NewFoodData[] };
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