'use client'

import DayMeals from '@/app/DayMeals'
import MealView, { MealViewProps } from '@/app/(meal)/MealView'
import { listDays } from '@/controllers/days'
import { Day } from '@/model/dayModel'
import { User } from '@/model/userModel'
import { Suspense, useEffect, useState } from 'react'
import { useUserContext } from '@/context/users.context'

export default function Page() {
  const [days, setDays] = useState<Day[]>([])
  const [mealProps, setMealProps] = useState<MealViewProps[][]>([])

  const { user } = useUserContext()

  const fetchDays = async (userId: User['id']) => {
    const days = await listDays(userId)
    setDays(days)

    const mealProps = days.map((day) => {
      return day.meals.map((meal): MealViewProps => {
        return {
          mealData: meal,
          header: (
            <MealView.Header
              onUpdateMeal={(meal) => alert(`Mock: Update meal ${meal.name}`)}
            />
          ),
          content: (
            <MealView.Content
              onEditItemGroup={(group) =>
                alert(`Mock: Edit group.id = "${group.id}"`)
              }
            />
          ),
          actions: <MealView.Actions onNewItem={() => alert('Mock: New item')} />,
        }
      })
    })
    setMealProps(mealProps)
  }

  useEffect(() => {
    if (user.loading || user.errored) {
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
