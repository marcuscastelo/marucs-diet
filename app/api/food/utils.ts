import FOOD_SECRETS from '@/secrets/food_api.json';

import axios from 'axios';
import fs from 'fs/promises';

let calls = 0;
const RANDOM_ID = Math.floor(Math.random() * 10000000).toString();

export const searchFoodNameInternal = async (food: string) => {
    const url = `${FOOD_SECRETS.base_url}/${FOOD_SECRETS.food_endpoint}`;
    const response = await axios.get(url, {
        headers: FOOD_SECRETS.headers,
        params: {
            ...FOOD_SECRETS.params,
            search: food
        }
    });
    console.log(response.data);
    console.dir(response.data);

    calls++;
    await fs.mkdir(`./logs/${RANDOM_ID}`, { recursive: true });
    await fs.writeFile(`./logs/${RANDOM_ID}/response-${calls}.json`, JSON.stringify(response.data, null, 2));

    return response.data;
}