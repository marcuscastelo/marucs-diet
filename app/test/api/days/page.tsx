'use client'

import DayMeals from '@/app/DayMeals'
import Meal, { MealProps } from '@/app/(meal)/Meal'
import { listDays } from '@/controllers/days'
import { Day } from '@/model/dayModel'
import { User } from '@/model/userModel'
import { useUser } from '@/redux/features/userSlice'
import { Suspense, useEffect, useState } from 'react'

export default function Page() {
  const [days, setDays] = useState<Day[]>([])
  const [mealProps, setMealProps] = useState<MealProps[][]>([])

  const { user } = useUser()

  const fetchDays = async (userId: User['id']) => {
    const days = await listDays(userId)
    setDays(days)

    const mealProps = days.map((day) => {
      return day.meals.map((meal): MealProps => {
        return {
          mealData: meal,
          header: (
            <Meal.Header
              onUpdateMeal={(meal) => alert(`Mock: Update meal ${meal.name}`)}
            />
          ),
          content: (
            <Meal.Content
              onEditItemGroup={(group) =>
                alert(`Mock: Edit group.id = "${group.id}"`)
              }
            />
          ),
          actions: <Meal.Actions onNewItem={() => alert('Mock: New item')} />,
        }
      })
    })
    setMealProps(mealProps)
  }

  useEffect(() => {
    if (user.loading) {
      return
    }

    fetchDays(user.data.id)
  }, [user])

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        {days.map((day, idx) => (
          <div key={idx}>
            <div className="text-2xl font-bold">{day.target_day}</div>
            {mealProps[idx].length > 0 ? (
              <DayMeals mealsProps={mealProps[idx]} />
            ) : (
              <div>No meals</div>
            )}
          </div>
        ))}
      </Suspense>
    </>
  )
}
