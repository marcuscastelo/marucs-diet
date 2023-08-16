'use client'

import MealView, { MealViewProps } from './MealView'

export type DayMealsProps = {
  mealsProps: MealViewProps[]
  className?: string
}

export default function MealList({ mealsProps, className }: DayMealsProps) {
  return (
    <div className={className}>
      {mealsProps.map((mealProps, index) => (
        <MealView key={index} {...mealProps} className="mt-2" />
      ))}
    </div>
  )
}
