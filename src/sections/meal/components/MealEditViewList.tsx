'use client'

import { ReadonlySignal, computed } from '@preact/signals-react'
import MealEditView, {
  MealEditViewProps,
} from '@/sections/meal/components/MealEditView'

export type DayMealsProps = {
  mealEditPropsList: ReadonlySignal<MealEditViewProps[]>
  className?: string
}

export default function MealEditViewList({
  mealEditPropsList,
  className,
}: DayMealsProps) {
  return (
    <div className={className}>
      {mealEditPropsList.value.map((_, index) => {
        const mealPropsSignal = computed(() => mealEditPropsList.value[index])
        return (
          <MealEditView
            key={index}
            {...mealPropsSignal.value}
            className="mt-2"
          />
        )
      })}
    </div>
  )
}
