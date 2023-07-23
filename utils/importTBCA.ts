import { Food } from '@/model/foodModel'
import TBCAJson from './tbca.json'
import { createFood, deleteAll } from '@/controllers/food'
import parallelLimit from 'async/parallelLimit';

const TBCA = TBCAJson as { [key: string]: Food }

export async function deleteAndReimportFoods(progressCallback?: (total: number) => void) {
    const total = Object.values(TBCA).length;

    console.log('Deleting all foods...');
    await deleteAll();

    console.log('Finished deleting foods.');
    console.log('Waiting 3 seconds...');

    // sleep for 1 second to allow the server to catch up
    await new Promise(r => setTimeout(r, 3000));

    console.log('Finished waiting.');

    console.log('Creating foods...');

    await parallelLimit(Object.values(TBCA).map((food) => async () => {
        console.log(`Creating ${food.name}...`);
        try {
            await createFood(food);
            if (progressCallback) progressCallback(total);
        } catch (e) {
            console.error(e);
        }
        console.log(`Finished ${food.name}.`);
    }), 10);
}