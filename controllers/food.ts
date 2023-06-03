import { FoodData } from '@/model/foodModel';
import PocketBase, { Record } from 'pocketbase'

const pb = new PocketBase('http://localhost:8090');

export const listFoods = async () => {
    const first = await pb.collection('Foods').getList(undefined, undefined, { $autoCancel: false });

    const totalPages = first.totalPages;

    const rest = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) => i + 2).map((page) =>
            pb.collection('Foods').getList(page, undefined, { $autoCancel: false, $page: page })
        )
    );

    const items = first.items.concat(...rest.map((r) => r.items));

    return items as (Record & FoodData)[];
}

export const createFood = async (food: FoodData) => await pb.collection('Foods').create(food) as (Record & FoodData);