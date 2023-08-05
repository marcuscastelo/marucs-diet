'use client'

import FoodItemView from '@/app/(foodItem)/FoodItemView'
import { listFoods } from '@/controllers/food'
import { Food } from '@/model/foodModel'
import { Alert, Breadcrumb } from 'flowbite-react'
import { useEffect, useState } from 'react'

export default function Page() {
  const [search, setSearch] = useState<string>('')
  const [foods, setFoods] = useState<Food[]>([])

  const fetchFoods = async () => {
    const foods = await listFoods(10)
    setFoods(foods)
  }

  useEffect(() => {
    fetchFoods()
  }, [])

  const filteredFoods = foods
    .filter((food) => {
      if (search === /* TODO: Check if equality is a bug */ '') {
        return true
      }

      // Fuzzy search
      const searchLower = search.toLowerCase()
      const nameLower = food.name.toLowerCase()
      const searchWords = searchLower.split(' ')
      const nameWords = nameLower.split(' ')

      for (const searchWord of searchWords) {
        let found = false
        for (const nameWord of nameWords) {
          if (nameWord.startsWith(searchWord)) {
            found = true
            break
          }
        }

        if (!found) {
          return false
        }
      }

      return true
    })
    .slice(0, 100)

  return (
    <>
      <Breadcrumb
        aria-label="Solid background breadcrumb example"
        className="bg-gray-50 px-5 py-3 dark:bg-gray-900"
      >
        <Breadcrumb.Item href="#">
          <p>Home</p>
        </Breadcrumb.Item>
        <Breadcrumb.Item href="#">2023-06-03</Breadcrumb.Item>
        <Breadcrumb.Item>Café da manhã</Breadcrumb.Item>
      </Breadcrumb>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            aria-hidden="true"
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="search"
          id="default-search"
          className="block w-full border-gray-600 bg-gray-700 p-4 pl-10 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Buscar alimentos"
          required
        />
      </div>

      {filteredFoods.length === /* TODO: Check if equality is a bug */ 0 && (
        <Alert color="warning" className="mt-2">
          Nenhum alimento encontrado para a busca &quot;{search}&quot;.
        </Alert>
      )}

      {filteredFoods.map((food, idx) => (
        <div key={idx}>
          <FoodItemView
            key={idx}
            foodItem={{
              id: 123,
              quantity: 100,
              macros: {
                ...food.macros,
              },
              reference: food.id,
              type: 'food',
            }}
          />
        </div>
      ))}
    </>
  )
}
