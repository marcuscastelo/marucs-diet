'use client'

import { mockMeal } from '../(mock)/mockData'
import { Dispatch, SetStateAction, useState } from 'react'
import DayMeals from '@/app/DayMeals'
import { MealProps } from '@/app/(meal)/Meal'
import { duplicateLastMealItem } from '../(mock)/mockActions'
import { MealData } from '@/model/mealModel'

export default function DayPage() {
  // TODO: reenable Day Meals Unit Test Component
  // const createMealProps = ([meal, setMeal]: [meal: MealData, setMeal: Dispatch<SetStateAction<MealData>>]): MealProps => {
  //     return {
  //         mealData: meal,
  //         onNewItem: () => {
  //             duplicateLastMealItem(meal, setMeal);
  //         },
  //         onEditItem: () => { alert('Editar') },
  //         onUpdateMeal: () => { alert('Atualizar') },
  //     };
  // }

  return (
    <>
      {/* <DayMeals mealsProps={[
                createMealProps(useState(mockMeal({name: 'Café da manhã'}))),
                createMealProps(useState(mockMeal({name: 'Almoço'}))),
                createMealProps(useState(mockMeal({name: 'Oi mãe'})))
            ]} /> */}
    </>
  )
}
