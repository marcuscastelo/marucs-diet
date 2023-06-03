"use client";

export const revalidate = 0

import MealItem from '@/app/MealItem';
import { mockItem } from '../../(mock)/mockItemData';
import { Suspense } from 'react';
import { createFood, listFoods } from '@/controllers/food';
import FoodsRealtime from './FoodsRealtime';

export default async function Page() {
    // const foods = await listFoods();
    return <FoodsRealtime initialFoods={[]} />
}