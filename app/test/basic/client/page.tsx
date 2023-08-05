'use client'

import { upsertFood, listFoods } from '@/controllers/food'
import { Food } from '@/model/foodModel'
import { useEffect, useState } from 'react'
import { mockFood } from '../../unit/(mock)/mockData'

export default function Page() {
  const [foods, setFoods] = useState<Food[]>([mockFood()])

  const fetchFoods = async () => {
    const foods = await listFoods(10)
    setFoods(foods)
  }

  const addFood = async () => {
    console.log('addFood')
    await upsertFood({
      name: 'Arroz',
      macros: {
        calories: 100,
        protein: 10,
        carbs: 10,
        fat: 10,
      },
    })
    fetchFoods()
  }

  useEffect(() => {
    fetchFoods()
  }, [])

  return (
    <>
      <button
        className="mt-3 min-w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        onClick={addFood}
      >
        Adicionar item
      </button>

      {foods.map((food, idx) => (
        <div key={idx}> {food?.name} </div>
      ))}
    </>
  )
}
