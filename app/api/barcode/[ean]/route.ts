// This is the route file for the barcode API

import { NextRequest, NextResponse } from "next/server";

import EAN_SECRETS from '@/secrets/ean_api.json';

import axios from 'axios';
import { apiFoodSchema } from "@/model/apiFoodModel";
import { isEanCached } from "@/controllers/eanCache";
import { convertApi2Food, searchFoodsByName } from "@/controllers/food";

//TODO: rename all barcodes to EAN?
const searchBarCodeInternal = async (barcode: string) => {
    const url = `${EAN_SECRETS.base_url}/${EAN_SECRETS.ean_endpoint}/${barcode}`;
    const response = await axios.get(url, {
        headers: EAN_SECRETS.headers
    });
    console.log(response.data);
    console.dir(response.data);
    return convertApi2Food(apiFoodSchema.parse(response.data));
    //TODO: retriggered cache this
}
//TODO: merge this with the food search by name (using query params like ?name= or ?ean=)
export async function GET(request: NextRequest, { params }: { params: { ean: string } }) {
    return NextResponse.json(await searchBarCodeInternal(params.ean));
}