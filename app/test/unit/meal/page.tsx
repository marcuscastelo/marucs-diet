'use client'

import { mockMeal } from '../(mock)/mockData'
import Meal from '@/app/(meal)/Meal'
import { useState } from 'react'
import { duplicateLastMealItem } from '../(mock)/mockActions'

export default function MealPage() {
  const [meal, setMeal] = useState(mockMeal())

  return (
    <Meal
      mealData={meal}
      header={<Meal.Header onUpdateMeal={(meal) => setMeal(meal)} />}
      content={
        <Meal.Content
          onEditItem={(item) => alert(`Mock: Edit "${item.food.name}"`)}
        />
      }
      actions={
        <Meal.Actions onNewItem={() => duplicateLastMealItem(meal, setMeal)} />
      }
    />
  )
}
