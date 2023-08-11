'use client'

import { mockMeal } from '../(mock)/mockData'
import MealView from '@/app/(meal)/MealView'
import { useState } from 'react'
import { duplicateLastMealItem } from '../(mock)/mockActions'

export default function MealPage() {
  const [meal, setMeal] = useState(mockMeal())

  return (
    <MealView
      mealData={meal}
      header={<MealView.Header onUpdateMeal={(meal) => setMeal(meal)} />}
      content={
        <MealView.Content
          onEditItemGroup={(group) =>
            alert(`Mock: Edit group.id = "${group.id}"`)
          }
        />
      }
      actions={
        <MealView.Actions onNewItem={() => duplicateLastMealItem(meal, setMeal)} />
      }
    />
  )
}
