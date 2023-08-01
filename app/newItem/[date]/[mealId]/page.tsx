'use client'

import MealItem from '@/app/(mealItem)/MealItem'
import { listFoods, searchFoodsByName } from '@/controllers/food'
import { Food } from '@/model/foodModel'
import { Alert, Breadcrumb } from 'flowbite-react'
import { useEffect, useRef, useState } from 'react'
import PageLoading from '../../../PageLoading'
import MealItemAddModal from '../../../MealItemAddModal'
import { mockFood } from '../../../test/unit/(mock)/mockData'
import { MealItemData } from '@/model/mealItemModel'
import { listDays, updateDay } from '@/controllers/days'
import { Day } from '@/model/dayModel'
import BarCodeInsertModal from '@/app/BarCodeInsertModal'
import { useFavoriteFoods, useUser } from '@/redux/features/userSlice'
import { User } from '@/model/userModel'
import { Loadable } from '@/utils/loadable'
import LoadingRing from '@/app/LoadingRing'
import { useRouter } from 'next/navigation'
import { ModalRef } from '@/app/(modals)/modal'

const MEAL_ITEM_ADD_MODAL_ID = 'meal-item-add-modal'
const BAR_CODE_INSERT_MODAL_ID = 'bar-code-insert-modal'

type PageProperties = {
  params: {
    date: string
    mealId: string
  }
}

// TODO: Refactor client-side cache vs server-side cache vs no cache logic on search
export default function Page({ params }: PageProperties) {
  const router = useRouter()

  const FOOD_LIMIT = 100
  const TYPE_TIMEOUT = 1000

  const dayParam = params.date

  const { user } = useUser()

  const [search, setSearch] = useState<string>('')
  const [foods, setFoods] = useState<Loadable<Food[]>>({ loading: true })
  const [days, setDays] = useState<Loadable<Day[]>>({ loading: true })

  const [selectedFood, setSelectedFood] = useState(
    mockFood({ name: 'BUG: SELECTED FOOD NOT SET' }),
  )
  const [quantity, setQuantity] = useState<number>(0)

  const [showingMealItemAddModal, setShowingMealItemAddModal] = useState(false)
  const [showingBarCodeInsertModal, setShowingBarCodeInsertModal] =
    useState(false)

  const mealItemAddModalRef = useRef<ModalRef>(null)
  const barCodeInsertModalRef = useRef<ModalRef>(null)

  const [searchingFoods, setSearchingFoods] = useState(false)

  const [typing, setTyping] = useState(false)

  const [isClient, setIsClient] = useState(false)

  const isDesktop = isClient ? window.innerWidth > 768 : false

  const { isFoodFavorite, setFoodAsFavorite } = useFavoriteFoods()

  const fetchFoods = async (search: string | '', favoriteFoods: number[]) => {
    setSearchingFoods(true)
    setFoods({ loading: false, data: [] })

    let foods: Food[] = []
    if (search === /* TODO: Check if equality is a bug */ '') {
      foods = await listFoods(100, favoriteFoods)
    } else {
      foods = await searchFoodsByName(search, 100, favoriteFoods)
    }

    setSearchingFoods(false)

    const isFavorite = (favoriteFoods: number[], food: Food) => {
      return favoriteFoods.includes(food.id)
    }

    // Sort favorites first
    const sortedFoods = foods.sort((a, b) => {
      if (isFavorite(favoriteFoods, a) && !isFavorite(favoriteFoods, b)) {
        return -1 // a comes first
      }

      if (!isFavorite(favoriteFoods, a) && isFavorite(favoriteFoods, b)) {
        return 1 // b comes first
      }

      return 0
    })

    setFoods({
      loading: false,
      data: sortedFoods,
    })
  }

  const fetchDays = async (userId: User['id']) => {
    const days = await listDays(userId)
    setDays({
      loading: false,
      data: days,
    })
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (user.loading || typing) {
      return
    }

    fetchFoods(search, user.data.favorite_foods)
    fetchDays(user.data.id)
  }, [user, search, typing])

  useEffect(() => {
    setTyping(true)

    const timeout = setTimeout(() => {
      setTyping(false)
    }, TYPE_TIMEOUT)

    return () => {
      clearTimeout(timeout)
    }
  }, [search])

  if (foods.loading) {
    return <PageLoading message="Carregando alimentos" />
  }

  if (days.loading) {
    return <PageLoading message="Carregando dias" />
  }

  const filteredFoods = foods.data
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
    .slice(0, FOOD_LIMIT)

  const day = days.data.find(
    (day) => day.target_day === /* TODO: Check if equality is a bug */ dayParam,
  )

  if (!day) {
    return (
      <>
        <TopBar
          dayParam={dayParam}
          mealName={'Erro 404 - Dia não encontrado'}
        />
        <Alert color="red" className="mt-2">
          Dia não encontrado {dayParam}.
        </Alert>
        <div className="bg-gray-800 p-1">
          Dias disponíveis:
          {JSON.stringify(
            days.data.map((d) => d.target_day),
            null,
            2,
          )}
        </div>
      </>
    )
  }

  const meal = day.meals.find(
    (meal) =>
      meal.id.toString() ===
      /* TODO: Check if equality is a bug */ params.mealId,
  )

  if (!meal) {
    return (
      <>
        <Alert color="red" className="mt-2">
          Refeição não encontrada: &apos;{params.mealId}&apos;.
        </Alert>
        <div className="bg-gray-800 p-1">
          Refeições disponíveis para o dia {dayParam}:&nbsp;
          {JSON.stringify(
            day.meals.map((m) => m.id),
            null,
            2,
          )}
        </div>
      </>
    )
  }

  const onNewMealItem = async (mealItem: MealItemData) => {
    await updateDay(day.id, {
      ...day,
      meals: day.meals.map((m) => {
        if (m.id === /* TODO: Check if equality is a bug */ meal.id) {
          return {
            ...m,
            items: [...m.items, mealItem],
          }
        }

        return m
      }),
    })

    // Prompt if user wants to add another item or go back (Yes/No)
    const oneMore = confirm(
      'Item adicionado com sucesso. Deseja adicionar outro item?',
    )

    if (!oneMore) {
      router.push(`/day/${dayParam}`)
    } else {
      setSelectedFood(mockFood({ name: 'BUG: SELECTED FOOD NOT SET' }))
      mealItemAddModalRef.current?.close()
    }
  }

  return (
    <>
      <TopBar dayParam={dayParam} mealName={meal.name} />

      <div className="mb-2 flex justify-start">
        <button
          onClick={() => {
            barCodeInsertModalRef.current?.showModal()
          }}
          className="mt-2 rounded bg-gray-800 px-4 py-2 font-bold text-white hover:bg-gray-700"
        >
          Inserir código de barras
        </button>
      </div>

      <BarCodeInsertModal
        modalId={BAR_CODE_INSERT_MODAL_ID}
        ref={barCodeInsertModalRef}
        onSelect={(food) => {
          setSelectedFood(food)
          mealItemAddModalRef.current?.showModal()
        }}
      />

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
          autoFocus={isDesktop}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="search"
          id="default-search"
          className="block w-full border-gray-600 bg-gray-700 p-4 pl-10 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Buscar alimentos"
          required
        />
      </div>

      {!searchingFoods &&
        !typing &&
        filteredFoods.length === /* TODO: Check if equality is a bug */ 0 && (
          <Alert color="warning" className="mt-2">
            Nenhum alimento encontrado para a busca &quot;{search}&quot;.
          </Alert>
        )}

      <MealItemAddModal
        modalId={MEAL_ITEM_ADD_MODAL_ID}
        ref={mealItemAddModalRef}
        meal={meal}
        itemData={{
          food: selectedFood,
        }}
        onApply={async (i) => onNewMealItem(i)}
      />

      <div className="bg-gray-800 p-1">
        {searchingFoods &&
        filteredFoods.length === /* TODO: Check if equality is a bug */ 0 ? (
          <PageLoading message="Carregando alimentos" />
        ) : (
          <>
            {filteredFoods.map((food, idx) => (
              <div key={idx}>
                <MealItem
                  mealItem={{
                    id: Math.random() * 1000000,
                    food,
                    quantity: 100,
                  }}
                  className="mt-1"
                  onClick={() => {
                    setSelectedFood(food)
                    mealItemAddModalRef.current?.showModal()
                    barCodeInsertModalRef.current?.close()
                  }}
                  header={
                    <MealItem.Header
                      name={<MealItem.Header.Name />}
                      favorite={
                        <MealItem.Header.Favorite
                          favorite={isFoodFavorite(food.id)}
                          setFavorite={(favorite) =>
                            setFoodAsFavorite(food.id, favorite)
                          }
                        />
                      }
                    />
                  }
                  nutritionalInfo={<MealItem.NutritionalInfo />}
                />
              </div>
            ))}
            {searchingFoods && filteredFoods.length > 0 && <LoadingRing />}
          </>
        )}
      </div>
    </>
  )
}

const TopBar = ({
  dayParam,
  mealName,
}: {
  dayParam: string
  mealName: string
}) => (
  <Breadcrumb
    aria-label="Solid background breadcrumb example"
    className="bg-gray-50 px-5 py-3 dark:bg-gray-900"
  >
    <Breadcrumb.Item href="/">
      <p>Home</p>
    </Breadcrumb.Item>
    <Breadcrumb.Item href="#">{dayParam}</Breadcrumb.Item>
    <Breadcrumb.Item>{mealName}</Breadcrumb.Item>
    {/* <UserSelector /> */}
  </Breadcrumb>
)
