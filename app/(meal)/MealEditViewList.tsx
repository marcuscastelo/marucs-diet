'use client'

import MealEditView, { MealEditViewProps } from './MealEditView'

export type DayMealsProps = {
  mealEditPropsList: MealEditViewProps[]
  className?: string
}

export default function MealEditViewList({
  mealEditPropsList,
  className,
}: DayMealsProps) {
  return (
    <div className={className}>
      {mealEditPropsList.map((mealProps, index) => (
        <MealEditView key={index} {...mealProps} className="mt-2" />
      ))}
    </div>
  )
}
