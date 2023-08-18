'use client'

import FoodItemView from '@/app/(foodItem)/FoodItemView'
import UserSelector from '@/app/UserSelector'
import { useFoodContext } from '@/context/food.context'
import { useUserContext } from '@/context/users.context'
import { useEffect, useState } from 'react'

export default function Page() {
  const { foods, refetchFoods } = useFoodContext()
  const { isFoodFavorite } = useUserContext()
  const [search, setSearch] = useState<string>('')

  useEffect(() => {
    refetchFoods(search)
  }, [refetchFoods, search])

  if (foods.loading || foods.errored) {
    return <div>Loading...</div>
  }

  return (
    <>
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
        {/* <button type="submit" className="text-white absolute right-2.5 bottom-2.5 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 focus:ring-blue-800">Search</button> */}
      </div>
      <UserSelector />
      {foods.data
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
        .map((food, idx) => (
          <div key={idx}>
            <FoodItemView
              key={idx}
              foodItem={{
                id: 123,
                name: food.name,
                quantity: 100,
                macros: {
                  ...food.macros,
                },
                reference: food.id,
              }}
              header={
                <FoodItemView.Header
                  name={<FoodItemView.Header.Name />}
                  favorite={
                    <FoodItemView.Header.Favorite
                      favorite={isFoodFavorite(food.id)}
                    />
                  }
                />
              }
              nutritionalInfo={<FoodItemView.NutritionalInfo />}
            />
          </div>
        ))}
    </>
  )
}
