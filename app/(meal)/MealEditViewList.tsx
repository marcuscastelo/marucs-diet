'use client'

import MealEditView, { MealEditViewProps } from './MealEditView'

export type DayMealsProps = {
  mealsProps: MealEditViewProps[]
  className?: string
}

export default function MealEditViewList({
  mealsProps,
  className,
}: DayMealsProps) {
  return (
    <div className={className}>
      {mealsProps.map((mealProps, index) => (
        <MealEditView key={index} {...mealProps} className="mt-2" />
      ))}
    </div>
  )
}
