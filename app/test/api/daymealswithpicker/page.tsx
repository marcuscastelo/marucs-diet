'use client'

import MealEditViewList from '@/app/(meal)/MealEditViewList'
import MealEditView, { MealEditViewProps } from '@/app/(meal)/MealEditView'
import { listDays } from '@/controllers/days'
import { Day } from '@/model/dayModel'
import { User } from '@/model/userModel'
import { stringToDate } from '@/utils/dateUtils'
import { useEffect, useState } from 'react'
import Datepicker from 'react-tailwindcss-datepicker'
import { DateValueType } from 'react-tailwindcss-datepicker/dist/types'
import { useUserContext } from '@/context/users.context'
import { computed } from '@preact/signals-react'

export default function Page() {
  const [days, setDays] = useState<Day[]>([])
  const [, setMealProps] = useState<MealEditViewProps[][]>([])

  const [selectedDay, setSelectedDay] = useState('')

  const { user } = useUserContext()

  const fetchDays = async (userId: User['id']) => {
    const days = await listDays(userId)
    setDays(days)

    const mealProps = days.map((day) => {
      return day.meals.map((_, idx): MealEditViewProps => {
        const meal = computed(() => day.meals[idx])
        return {
          meal,
          header: (
            <MealEditView.Header
              onUpdateMeal={(newMeal) =>
                alert(`Mock: Update meal ${newMeal.name}`)
              } // TODO: Change all alerts with ConfirmModal
            />
          ),
          content: (
            <MealEditView.Content
              onEditItemGroup={
                (group) => alert(`Mock: Edit group.id = "${group.id}"`) // TODO: Change all alerts with ConfirmModal
              }
            />
          ),
          // TODO: Change all alerts with ConfirmModal
          actions: (
            <MealEditView.Actions onNewItem={() => alert('Mock: New item')} />
          ),
        }
      })
    })
    setMealProps(mealProps)
  }

  const handleDayChange = (newValue: DateValueType) => {
    if (newValue?.startDate === undefined || newValue.startDate === '') {
      setSelectedDay('')
      return
    }

    const dateString = newValue.startDate === null ? '' : newValue.startDate
    const date = stringToDate(dateString)
    setSelectedDay(date.toISOString().split('T')[0]) // TODO: retriggered: use dateUtils when this is understood
  }

  useEffect(() => {
    fetchDays(user.id)
  }, [user])

  const hasData = days.some((day) => day.target_day === selectedDay)
  const day = days.find((day) => day.target_day === selectedDay)

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

      {hasData && day !== undefined && (
        <>
          <h1> Target day: {day.target_day}</h1>
          <MealEditViewList
            mealEditPropsList={computed(() =>
              day.meals.map((_, idx): MealEditViewProps => {
                const meal = computed(() => day.meals[idx])
                return {
                  meal,
                  header: (
                    <MealEditView.Header
                      onUpdateMeal={
                        (newMeal) => alert(`Mock: Update meal ${newMeal.name}`) // TODO: Change all alerts with ConfirmModal
                      }
                    />
                  ),
                  content: (
                    <MealEditView.Content
                      onEditItemGroup={
                        (group) => alert(`Mock: Edit group.id = "${group.id}"`) // TODO: Change all alerts with ConfirmModal
                      }
                    />
                  ),
                  actions: (
                    <MealEditView.Actions
                      onNewItem={() => alert('Mock: New item')} // TODO: Change all alerts with ConfirmModal
                    />
                  ),
                }
              }),
            )}
          />
        </>
      )}
    </>
  )
}
