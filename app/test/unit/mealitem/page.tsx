"use client";

import MealItem from "@/app/(mealItem)/MealItem";
import { mockItem } from "../(mock)/mockData";

export default function MealItemPage() {
    return (
        <MealItem mealItem={mockItem()} 
        />
    )
}