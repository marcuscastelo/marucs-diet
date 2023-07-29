// This is the route file for the food search API.
import { NextRequest, NextResponse } from "next/server";
import { searchFoodNameInternal } from "./utils";

export async function GET(request: NextRequest) {
    return NextResponse.json(await searchFoodNameInternal(request.nextUrl.searchParams.get("q") ?? ''));
}