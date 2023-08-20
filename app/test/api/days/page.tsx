'use client'

import MealEditViewList from '@/app/(meal)/MealEditViewList'
import MealEditView, { MealEditViewProps } from '@/app/(meal)/MealEditView'
import { listDays } from '@/controllers/days'
import { Day } from '@/model/dayModel'
import { User } from '@/model/userModel'
import { Suspense, useEffect, useState } from 'react'
import { useUserContext } from '@/context/users.context'

export default function Page() {
  const [days, setDays] = useState<Day[]>([])
  const [mealEditPropsList, setMealProps] = useState<MealEditViewProps[][]>([])

  const { user } = useUserContext()

  const fetchDays = async (userId: User['id']) => {
    const days = await listDays(userId)
    setDays(days)

    const mealProps = days.map((day) => {
      return day.meals.map((meal): MealEditViewProps => {
        return {
          meal,
          header: (
            <MealEditView.Header
              onUpdateMeal={(meal) => alert(`Mock: Update meal ${meal.name}`)}
            />
          ),
          content: (
            <MealEditView.Content
              onEditItemGroup={(group) =>
                alert(`Mock: Edit group.id = "${group.id}"`)
              }
            />
          ),
          actions: (
            <MealEditView.Actions onNewItem={() => alert('Mock: New item')} />
          ),
        }
      })
    })
    setMealProps(mealProps)
  }

  useEffect(() => {
    fetchDays(user.id)
  }, [user])

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        {days.map((day, idx) => (
          <div key={idx}>
            <div className="text-2xl font-bold">{day.target_day}</div>
            {mealEditPropsList[idx].length > 0 ? (
              <MealEditViewList mealEditPropsList={mealEditPropsList[idx]} />
            ) : (
              <div>No meals</div>
            )}
          </div>
        ))}
      </Suspense>
    </>
  )
}
