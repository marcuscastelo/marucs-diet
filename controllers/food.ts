import { Food } from '@/model/foodModel';
import { Record } from 'pocketbase';

import pb from '@/utils/pocketBase';
import { parallelLimit } from 'async';
import { listAll } from './utils';
import axios from 'axios';
import { NewFoodData } from '@/model/newFoodModel';

const PB_COLLECTION = 'Food';

function hackConvert(food: NewFoodData, filler: Food) : Food {
    return {
        ...filler,
        id: food.id.toString(),
        name: food.nome,
        tbcaId: food.id.toString(),
        macros: {
            calories: food.calorias * 100,
            carbs: food.carboidratos * 100,
            protein: food.proteinas * 100,
            fat: food.gordura * 100,
        }
    } as Food; 
}

export const listFoods = async () => {
    const cached = await listAll<Food>(PB_COLLECTION);
    const newFoods = (await axios.get(`http://192.168.0.14:3000/api/food`)).data as { alimentos: NewFoodData[] };
    return newFoods.alimentos.map((food, idx) => hackConvert(food, cached[idx]));
}

export const searchFoods = async (search: string) => {
    const cached = await listAll<Food>(PB_COLLECTION);
    const newFoods = (await axios.get(`http://192.168.0.14:3000/api/food/${search}`)).data as { alimentos: NewFoodData[] };
    return newFoods.alimentos.map((food, idx) => hackConvert(food, cached[idx]));
}

export const createFood = async (food: Food) => await pb.collection(PB_COLLECTION).create(food, { $autoCancel: false }) as (Record & Food);

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