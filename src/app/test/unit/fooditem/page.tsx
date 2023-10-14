'use client'

import FoodItemView from '@/app/(foodItem)/FoodItemView'
import { mockItem } from '@/app/test/unit/(mock)/mockData'
import { computed } from '@preact/signals-react'

export default function FoodItemPage() {
  return <FoodItemView foodItem={computed(mockItem)} />
}
