'use client'

import MealView, { MealViewProps } from './(meal)/MealView'

export type DayMealsProps = {
  mealsProps: MealViewProps[]
  className?: string
}

export default function DayMeals({ mealsProps, className }: DayMealsProps) {
  return (
    <div className={className}>
      {mealsProps.map((mealProps, index) => (
        <MealView key={index} {...mealProps} className="mt-2" />
      ))}
    </div>
  )
}
