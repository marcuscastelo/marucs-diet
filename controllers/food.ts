import { FoodData } from '@/model/foodModel';
import { Record } from 'pocketbase';

import pb from '@/utils/pocketBase';
import { parallelLimit } from 'async';
import { listAll } from './utils';

const PB_COLLECTION = 'Foods';

export const listFoods = () => listAll<FoodData>(PB_COLLECTION);

export const createFood = async (food: FoodData) => await pb.collection(PB_COLLECTION).create(food, { $autoCancel: false }) as (Record & FoodData);

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