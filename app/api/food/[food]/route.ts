// This is the route file for the barcode API

import { NextRequest, NextResponse } from "next/server";

import FOOD_SECRETS from '@/secrets/food_api.json';

import axios from 'axios';
import { NewFoodData } from "@/model/newFoodModel";
import { searchBarCodeInternal } from "../route";

export async function GET(request: NextRequest, {params} : {params: {food: string}}) {
    return NextResponse.json(await searchBarCodeInternal(params.food));
}