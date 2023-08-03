'use client'

import { FoodItem } from '@/model/mealItemModel'
import MacroNutrients from '../MacroNutrients'
import { MacroNutrientsData } from '@/model/macroNutrientsModel'
import { calculateCalories } from '../MacroTargets'
import { MealItemContextProvider, useMealItemContext } from './MealItemContext'
import CopyIcon from '../(icons)/CopyIcon'

export type MealItemProps = {
  mealItem: FoodItem
  header?: React.ReactNode
  nutritionalInfo?: React.ReactNode
  className?: string
  onClick?: (mealItem: FoodItem) => void
}

export default function MealItem({
  mealItem,
  header,
  nutritionalInfo,
  className,
  onClick,
}: MealItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    onClick?.(mealItem)
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
      <MealItemContextProvider mealItem={mealItem}>
        {header}
        {nutritionalInfo}
      </MealItemContextProvider>
    </div>
  )
}

MealItem.Header = MealItemHeader
MealItem.NutritionalInfo = MealItemNutritionalInfo

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
  const { mealItem } = useMealItemContext()

  return (
    <div className="">
      {/* //TODO: mealItem id is random, but it should be an entry on the database (meal too) */}
      {/* <h5 className="mb-2 text-lg font-bold tracking-tight text-white">ID: [{props.mealItem.id}]</h5> */}
      <h5 className="mb-2 text-lg font-bold tracking-tight text-white">
        {mealItem.food.name}{' '}
      </h5>
    </div>
  )
}

function MealItemCopyButton({
  handleCopyMealItem,
}: {
  handleCopyMealItem: (mealItem: FoodItem) => void
}) {
  const { mealItem } = useMealItemContext()

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
  const { mealItem } = useMealItemContext()

  const foodMacros = mealItem.food.macros

  const multipliedMacros: MacroNutrientsData = {
    carbs: (foodMacros.carbs * mealItem.quantity) / 100,
    protein: (foodMacros.protein * mealItem.quantity) / 100,
    fat: (foodMacros.fat * mealItem.quantity) / 100,
  }

  return (
    <div className="flex">
      <MacroNutrients {...multipliedMacros} />
      <div className="ml-auto">
        <span className="text-white"> {mealItem.quantity}g </span>|
        <span className="text-white">
          {' '}
          {calculateCalories({
            carbs: (mealItem.food.macros.carbs * mealItem.quantity) / 100,
            protein: (mealItem.food.macros.protein * mealItem.quantity) / 100,
            fat: (mealItem.food.macros.fat * mealItem.quantity) / 100,
          }).toFixed(0)}
          kcal{' '}
        </span>
      </div>
    </div>
  )
}
