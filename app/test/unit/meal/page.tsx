'use client'

import { mockMeal } from '../(mock)/mockData'
import MealEditView from '@/app/(meal)/MealEditView'
import { useState } from 'react'
import { duplicateLastItemGroup } from '../(mock)/mockActions'

export default function MealPage() {
  const [meal, setMeal] = useState(mockMeal())

  return (
    <MealEditView
      meal={meal}
      header={<MealEditView.Header onUpdateMeal={(meal) => setMeal(meal)} />}
      content={
        <MealEditView.Content
          onEditItemGroup={
            (group) => alert(`Mock: Edit group.id = "${group.id}"`) // TODO: Change all alerts with ConfirmModal
          }
        />
      }
      actions={
        <MealEditView.Actions
          onNewItem={() => duplicateLastItemGroup(meal, setMeal)}
        />
      }
    />
  )
}
