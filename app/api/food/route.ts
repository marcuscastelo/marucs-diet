// This is the route file for the food search API.

import { NextRequest, NextResponse } from "next/server";

import FOOD_SECRETS from '@/secrets/food_api.json';

import axios from 'axios';
import { apiFoodSchema } from "@/model/apiFoodModel";

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
    return apiFoodSchema.parse(response.data);
}

export async function GET(request: NextRequest) {
    return NextResponse.json(await searchFoodNameInternal(request.nextUrl.searchParams.get("q") ?? ''));
}