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
          onEditItemGroup={(group) =>
            alert(`Mock: Edit group.id = "${group.id}"`)
          }
        />
      }
      actions={
        <Meal.Actions onNewItem={() => duplicateLastMealItem(meal, setMeal)} />
      }
    />
  )
}
