// This is the route file for the barcode API

import { NextRequest, NextResponse } from "next/server";

import { searchBarCodeInternal } from "../route";

export async function GET(request: NextRequest, {params} : {params: {food: string}}) {
    return NextResponse.json(await searchBarCodeInternal(params.food));
}