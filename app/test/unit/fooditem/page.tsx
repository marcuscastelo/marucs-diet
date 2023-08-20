'use client'

import FoodItemView from '@/app/(foodItem)/FoodItemView'
import { mockItem } from '../(mock)/mockData'

export default function FoodItemPage() {
  return <FoodItemView foodItem={mockItem()} />
}
