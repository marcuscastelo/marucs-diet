import { FoodData } from '@/model/foodModel';
import { Record } from 'pocketbase';

import pb from '@/utils/pocketBase';
import { parallelLimit } from 'async';

export const listFoods = async () => {
    const first = await pb.collection('Foods').getList(undefined, 1000, { $autoCancel: false });

    const totalPages = first.totalPages;

    const rest = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) => i + 2).map((page) =>
            pb.collection('Foods').getList(page, 1000, { $autoCancel: false, $page: page })
        )
    );

    const items = first.items.concat(...rest.map((r) => r.items));

    return items as (Record & FoodData)[];
}

export const createFood = async (food: FoodData) => await pb.collection('Foods').create(food, { $autoCancel: false }) as (Record & FoodData);

export const deleteAll = async () => {
    const foods = await listFoods();
    console.log(`Deleting ${foods.length} foods...`);
    const actions = foods.map((food) => async () => {
        while (true) {
            try {
                await pb.collection('Foods').delete(food.id, { $autoCancel: false })
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