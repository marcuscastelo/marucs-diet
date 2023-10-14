'use client'

import { mockMeal } from '@/app/test/unit/(mock)/mockData'
import MealEditView from '@/app/(meal)/MealEditView'
import { duplicateLastItemGroup } from '@/app/test/unit/(mock)/mockActions'
import { useSignal } from '@preact/signals-react'

export default function MealPage() {
  const meal = useSignal(mockMeal())

  return (
    <MealEditView
      meal={meal}
      header={
        <MealEditView.Header
          onUpdateMeal={(newMeal) => (meal.value = newMeal)}
        />
      }
      content={
        <MealEditView.Content
          onEditItemGroup={
            (group) => alert(`Mock: Edit group.id = "${group.id}"`) // TODO: Change all alerts with ConfirmModal
          }
        />
      }
      actions={
        <MealEditView.Actions onNewItem={() => duplicateLastItemGroup(meal)} />
      }
    />
  )
}
