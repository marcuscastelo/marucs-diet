'use client'

// TODO: Reenable DayMealsWithPicker Integration Test Component
// import { Day } from '@/model/dayModel'
// import { useState } from 'react'
// import { DateValueType } from 'react-tailwindcss-datepicker/dist/types'
// import { mockMeal } from '../../unit/(mock)/mockData'
// import { MealEditViewProps } from '@/app/(meal)/MealEditView'
// import { getToday } from '@/utils/dateUtils'

export default function Page() {
  // const day1: Day = {
  //   id: generateId(),
  //   owner: generateId(),
  //   target_day: getToday(),
  //   meals: [mockMeal({ name: 'Café da manhã' }), mockMeal({ name: 'Almoço' })],
  // }

  // const day2: Day = {
  //   id: generateId(),
  //   owner: generateId(),
  //   target_day: getToday(),
  //   meals: [mockMeal({ name: 'Jejum' })],
  // }

  // TODO: Reenable DayMealsWithPicker Unit Test Component
  // const day1MealProps: MealProps[] = day1.meals.map(meal => {
  //     return {
  //         meal: meal,
  //         onNewItem: () => {alert('Dia 1: Novo') }, // TODO: Change all alerts with ConfirmModal
  //         onEditItem: () => {alert('Dia 1: Editar') }, // TODO: Change all alerts with ConfirmModal
  //         onUpdateMeal: () => {alert('Dia 1: Atualizar') }, // TODO: Change all alerts with ConfirmModal
  //     }
  // });

  // const day2MealProps: MealProps[] = day2.meals.map(meal => {
  //     return {
  //         meal: meal,
  //         onNewItem: () => {alert('Dia 2!!!: Novo') }, // TODO: Change all alerts with ConfirmModal
  //         onEditItem: () => {alert('Dia 2!!!: Editar') }, // TODO: Change all alerts with ConfirmModal
  //         onUpdateMeal: () => {alert('Dia 2!!!: Atualizar') }, // TODO: Change all alerts with ConfirmModal
  //     }
  // });

  // const [day, setDay] = useState<DateValueType>({
  //   startDate: getToday(),
  //   endDate: getToday(),
  // })
  // const [currentMealProps, setCurrentMealProps] = useState<MealEditViewProps[]>()

  // TODO: Reenable DayMealsWithPicker Unit Test Component
  // const handleDayChange = (newValue: DateValueType) => {
  //     const dateString = newValue?.startDate;
  //     if (!dateString) {
  //         alert('Data inválida'); // TODO: Change all alerts with ConfirmModal
  //         return;
  //     }
  //     const date = stringToDate(dateString);
  //     const dayOfMonth = date.getDate();
  //     setDay(newValue);
  //     if (dayOfMonth % 2 === /* TODO: Check if equality is a bug */ 0) {
  //         setCurrentMealProps(day2MealProps);
  //     }
  //     else {
  //         setCurrentMealProps(day1MealProps);
  //     }
  // }

  return (
    <>
      {/* <Datepicker
                asSingle={true}
                useRange={false}
                readOnly={true}
                value={day}
                onChange={handleDayChange}
            />
            //TODO: Check if equality is a bug 
            {currentMealProps ===  undefined && <Alert color="warning">Selecione uma data</Alert>}
            {currentMealProps !== undefined && <DayMeals mealsProps={currentMealProps} />} */}
    </>
  )
}
