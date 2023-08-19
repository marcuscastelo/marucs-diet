'use client'

import MealList from '@/app/(meal)/MealList'
import MealView, { MealViewProps } from '@/app/(meal)/MealView'
import { listDays } from '@/controllers/days'
import { Day } from '@/model/dayModel'
import { User } from '@/model/userModel'
import { stringToDate } from '@/utils/dateUtils'
import { useEffect, useState } from 'react'
import Datepicker from 'react-tailwindcss-datepicker'
import { DateValueType } from 'react-tailwindcss-datepicker/dist/types'
import { useUserContext } from '@/context/users.context'

export default function Page() {
  const [days, setDays] = useState<Day[]>([])
  const [, setMealProps] = useState<MealViewProps[][]>([])

  const [selectedDay, setSelectedDay] = useState('')

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
          actions: (
            <MealView.Actions onNewItem={() => alert('Mock: New item')} />
          ),
        }
      })
    })
    setMealProps(mealProps)
  }

  const handleDayChange = (newValue: DateValueType) => {
    if (!newValue?.startDate) {
      setSelectedDay('')
      return
    }

    const dateString = newValue?.startDate
    const date = stringToDate(dateString)
    setSelectedDay(date.toISOString().split('T')[0]) // TODO: retriggered: use dateUtils when this is understood
  }

  useEffect(() => {
    fetchDays(user.id)
  }, [user])

  // TODO: remove this function
  //   const duplicateLastMealItemOnDatabase = async (day: Day, meal: MealData) => {
  //     await updateDay(day.id, {
  //       ...day,
  //       meals: day.meals.map((m) => {
  //         if (m.id !== meal.id) return m

  //         const lastItem = m.items[m.items.length - 1]
  //         return {
  //           ...m,
  //           items: [...m.items, lastItem],
  //         }
  //       }),
  //     })

  //     await fetchDays(day.owner)
  //   }

  const hasData = days.some(
    (day) =>
      day.target_day === /* TODO: Check if equality is a bug */ selectedDay,
  )
  const dayData = days.find(
    (day) =>
      day.target_day === /* TODO: Check if equality is a bug */ selectedDay,
  )

  return (
    <>
      <Datepicker
        asSingle={true}
        useRange={false}
        readOnly={true}
        value={{
          startDate: selectedDay,
          endDate: selectedDay,
        }}
        onChange={handleDayChange}
      />

      <div className="text-2xl font-bold">selectedDay: {selectedDay}</div>
      <div>Has data: {hasData ? 'true' : 'false'}</div>
      <div>Known days: {days.map((day) => day.target_day).join(', ')}</div>

      {hasData && dayData !== undefined && (
        <>
          <h1> Target day: {dayData.target_day}</h1>
          <MealList
            mealsProps={dayData.meals.map((meal): MealViewProps => {
              return {
                mealData: meal,
                header: (
                  <MealView.Header
                    onUpdateMeal={(meal) =>
                      alert(`Mock: Update meal ${meal.name}`)
                    }
                  />
                ),
                content: (
                  <MealView.Content
                    onEditItemGroup={(group) =>
                      alert(`Mock: Edit group.id = "${group.id}"`)
                    }
                  />
                ),
                actions: (
                  <MealView.Actions onNewItem={() => alert('Mock: New item')} />
                ),
              }
            })}
          />
        </>
      )}

      {/* TODO: Check if equality is a bug */}
      {/* {currentMealProps === null && <Alert color="warning">Selecione uma data</Alert>} */}
      {/* {currentMealProps !== null && <MealList mealsProps={currentMealProps} />} */}
    </>
  )
}
