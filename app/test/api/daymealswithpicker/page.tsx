'use client'

import DayMeals from '@/app/DayMeals'
import Meal, { MealProps } from '@/app/(meal)/Meal'
import { listDays, updateDay } from '@/controllers/days'
import { Day } from '@/model/dayModel'
import { MealData } from '@/model/mealModel'
import { User } from '@/model/userModel'
import { useUser } from '@/redux/features/userSlice'
import { stringToDate } from '@/utils/dateUtils'
import { useEffect, useState } from 'react'
import Datepicker from 'react-tailwindcss-datepicker'
import { DateValueType } from 'react-tailwindcss-datepicker/dist/types'

export default function Page() {
  const [days, setDays] = useState<Day[]>([])
  const [, setMealProps] = useState<MealProps[][]>([])

  const [selectedDay, setSelectedDay] = useState('')

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
              onEditItem={(item) =>
                alert(`Mock: Edit foodid= "${item.reference}"`)
              }
            />
          ),
          actions: <Meal.Actions onNewItem={() => alert('Mock: New item')} />,
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
    if (user.loading) {
      return
    }

    fetchDays(user.data.id)
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
          <DayMeals
            mealsProps={dayData.meals.map((meal): MealProps => {
              return {
                mealData: meal,
                header: (
                  <Meal.Header
                    onUpdateMeal={(meal) =>
                      alert(`Mock: Update meal ${meal.name}`)
                    }
                  />
                ),
                content: (
                  <Meal.Content
                    onEditItem={(item) =>
                      alert(`Mock: Edit foodid= "${item.reference}"`)
                    }
                  />
                ),
                actions: (
                  <Meal.Actions onNewItem={() => alert('Mock: New item')} />
                ),
              }
            })}
          />
        </>
      )}

      {/* TODO: Check if equality is a bug */}
      {/* {currentMealProps === null && <Alert color="warning">Selecione uma data</Alert>} */}
      {/* {currentMealProps !== null && <DayMeals mealsProps={currentMealProps} />} */}
    </>
  )
}
