'use client'

import { FoodItem } from '@/model/foodItemModel'
import MacroNutrients from '../MacroNutrients'
import { MacroNutrientsData } from '@/model/macroNutrientsModel'
import { FoodItemContextProvider, useFoodItemContext } from './FoodItemContext'
import CopyIcon from '../(icons)/CopyIcon'
import { useEffect, useState } from 'react'
import { searchFoodById } from '@/controllers/food'
import { calcItemCalories } from '@/utils/macroMath'
import { useUserContext } from '@/context/users.context'
import { Template } from '../newItem/FoodSearch'
import { searchRecipeById } from '@/controllers/recipes'

export type FoodItemViewProps = {
  foodItem: FoodItem & { type?: 'food' | 'recipe' } // TODO: Replace all & { type: 'food' | 'recipe' } with a real type
  header?: React.ReactNode
  nutritionalInfo?: React.ReactNode
  className?: string
  // TODO: rename all mealItem occurrences to foodItem (or foodItemGroup)
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
      <FoodItemContextProvider
        foodItem={{
          type: 'food', // TODO: Remove this hack
          ...foodItem,
        }}
      >
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
      <div className={`ml-auto flex gap-2`}>
        <div className="my-auto">{copyButton}</div>
        <div className="my-auto">{favorite}</div>
      </div>
    </div>
  )
}

MealItemHeader.Name = MealItemName
MealItemHeader.CopyButton = MealItemCopyButton
MealItemHeader.Favorite = MealItemFavorite

function MealItemName() {
  const { foodItem: item } = useFoodItemContext()

  const { debug } = useUserContext()

  const [template, setTemplate] = useState<Template | null>(null)

  useEffect(() => {
    if (item.type === 'recipe') {
      searchRecipeById(item.reference).then((recipe) => setTemplate(recipe))
    } else {
      searchFoodById(item.reference).then((food) => setTemplate(food))
    }
  }, [item.type, item.reference])

  const getTemplateNameColor = () => {
    if (item.type === 'food') {
      return 'text-white'
    } else if (item.type === 'recipe') {
      return 'text-blue-500'
    } else {
      return 'text-red-500'
    }
  }

  return (
    <div className="">
      {/* //TODO: mealItem id is random, but it should be an entry on the database (meal too) */}
      {/* <h5 className="mb-2 text-lg font-bold tracking-tight text-white">ID: [{props.mealItem.id}]</h5> */}
      <h5
        className={`mb-2 text-lg font-bold tracking-tight ${getTemplateNameColor()}`}
      >
        {template?.name ?? 'food not found'}{' '}
        {debug && (
          <>
            <div className="text-sm text-gray-400">[ID: {item?.id}]</div>
            <div className="text-sm text-gray-400">[ID: {template?.id}]</div>
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
  onSetFavorite: setFavorite,
}: {
  favorite: boolean
  onSetFavorite?: (favorite: boolean) => void
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
          {calcItemCalories(item).toFixed(0)}
          kcal{' '}
        </span>
      </div>
    </div>
  )
}
