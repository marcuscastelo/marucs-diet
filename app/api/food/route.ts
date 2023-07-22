// This is the route file for the barcode API

import { NextRequest, NextResponse } from "next/server";

import FOOD_SECRETS from '@/secrets/food_api.json';

import axios from 'axios';
import { NewFoodData } from "@/model/newFoodModel";

export const searchBarCodeInternal = async (food: string) => {
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
    return response.data as NewFoodData;
}

export async function GET(request: NextRequest) {
    return NextResponse.json(await searchBarCodeInternal(""));
}