"use client";

import MealItem from "@/app/MealItem";
import { mockItem } from "../(mock)/mockItemData";

export default function MealItemPage() {
    return (
        <MealItem {...mockItem} />
    )
}