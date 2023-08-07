'use client'

import { FoodItem } from '@/model/foodItemModel'
import MacroNutrients from '../MacroNutrients'
import { MacroNutrientsData } from '@/model/macroNutrientsModel'
import { FoodItemContextProvider, useFoodItemContext } from './FoodItemContext'
import CopyIcon from '../(icons)/CopyIcon'
import { useEffect, useState } from 'react'
import { Food } from '@/model/foodModel'
import { searchFoodById } from '@/controllers/food'
import { calcItemCalories } from '@/utils/macroMath'
import { useDebug } from '@/redux/features/userSlice'

export type FoodItemViewProps = {
  foodItem: FoodItem
  header?: React.ReactNode
  nutritionalInfo?: React.ReactNode
  className?: string
  onClick?: (mealItem: FoodItem) => void
}

export default function FoodItemView({
  foodItem,
  header,
  nutritionalInfo,
  className,
  onClick,
}: FoodItemViewProps) {
  const handleClick = (e: React.MouseEvent) => {
    // TODO: Check if parameter is needed (foodItem doesn't seem to be changed)
    onClick?.(foodItem)
    e.stopPropagation()
    e.preventDefault()
  }

  return (
    <div
      className={`meal-item block rounded-lg border border-gray-700 bg-gray-700 p-3 shadow hover:cursor-pointer hover:bg-gray-700 ${
        className ?? ''
      }`}
      onClick={handleClick}
    >
      <FoodItemContextProvider foodItem={foodItem}>
        {header}
        {nutritionalInfo}
      </FoodItemContextProvider>
    </div>
  )
}

FoodItemView.Header = MealItemHeader
FoodItemView.NutritionalInfo = MealItemNutritionalInfo

export type MealItemHeaderProps = {
  name?: React.ReactNode
  favorite?: React.ReactNode
  copyButton?: React.ReactNode
}

function MealItemHeader({ name, favorite, copyButton }: MealItemHeaderProps) {
  return (
    <div className="flex">
      {/* //TODO: mealItem id is random, but it should be an entry on the database (meal too) */}
      {/* <h5 className="mb-2 text-lg font-bold tracking-tight text-white">ID: [{props.mealItem.id}]</h5> */}
      <div className="my-2">{name}</div>
      <div className={`ml-auto flex gap-2`}>{copyButton}</div>
      {favorite}
    </div>
  )
}

MealItemHeader.Name = MealItemName
MealItemHeader.CopyButton = MealItemCopyButton
MealItemHeader.Favorite = MealItemFavorite

function MealItemName() {
  const { foodItem: item } = useFoodItemContext()

  const { debug } = useDebug()

  const [food, setFood] = useState<Food | null>(null)

  useEffect(() => {
    searchFoodById(item.reference).then((food) => setFood(food))
  }, [item.reference])

  return (
    <div className="">
      {/* //TODO: mealItem id is random, but it should be an entry on the database (meal too) */}
      {/* <h5 className="mb-2 text-lg font-bold tracking-tight text-white">ID: [{props.mealItem.id}]</h5> */}
      <h5 className={`mb-2 text-lg font-bold tracking-tight text-white`}>
        {food?.name ?? 'food not found'}{' '}
        {debug && (
          <>
            <div className="text-sm text-gray-400">[ID: {item?.id}]</div>
            <div className="text-sm text-gray-400">[ID: {food?.id}]</div>
          </>
        )}
      </h5>
    </div>
  )
}

function MealItemCopyButton({
  handleCopyMealItem,
}: {
  handleCopyMealItem: (mealItem: FoodItem) => void
}) {
  const { foodItem: mealItem } = useFoodItemContext()

  return (
    <div
      className={`btn-ghost btn ml-auto mt-1 px-2 text-white hover:scale-105`}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        handleCopyMealItem(mealItem)
      }}
    >
      <CopyIcon />
    </div>
  )
}

function MealItemFavorite({
  favorite,
  setFavorite,
}: {
  favorite: boolean
  setFavorite?: (favorite: boolean) => void
}) {
  const toggleFavorite = (e: React.MouseEvent) => {
    setFavorite?.(!favorite)
    e.stopPropagation()
    e.preventDefault()
  }

  return (
    <div
      className={`ml-auto text-3xl text-orange-400 ${
        setFavorite ? 'hover:text-blue-200' : ''
      }`}
      onClick={toggleFavorite}
    >
      {favorite ? '★' : '☆'}
    </div>
  )
}

function MealItemNutritionalInfo() {
  const { foodItem: item } = useFoodItemContext()

  const multipliedMacros: MacroNutrientsData = {
    carbs: (item.macros.carbs * item.quantity) / 100,
    protein: (item.macros.protein * item.quantity) / 100,
    fat: (item.macros.fat * item.quantity) / 100,
  }

  return (
    <div className="flex">
      <MacroNutrients {...multipliedMacros} />
      <div className="ml-auto">
        <span className="text-white"> {item.quantity}g </span>|
        <span className="text-white">
          {' '}
          {/* // TODO: Use toFixed(0) on all calcItemCalories */}
          {calcItemCalories(item).toFixed(0)}
          kcal{' '}
        </span>
      </div>
    </div>
  )
}