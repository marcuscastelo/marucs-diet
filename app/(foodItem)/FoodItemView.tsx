'use client'

import { FoodItem } from '@/model/foodItemModel'
import MacroNutrientsView from '../MacroNutrientsView'
import { MacroNutrients } from '@/model/macroNutrientsModel'
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
  onClick?: (foodItem: FoodItem) => void
}

export default function FoodItemView({
  foodItem,
  header,
  nutritionalInfo,
  className,
  onClick,
}: FoodItemViewProps) {
  const handleClick = (e: React.MouseEvent) => {
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

FoodItemView.Header = FoodItemHeader
FoodItemView.NutritionalInfo = FoodItemNutritionalInfo

export type FoodItemHeaderProps = {
  name?: React.ReactNode
  favorite?: React.ReactNode
  copyButton?: React.ReactNode
}

function FoodItemHeader({ name, favorite, copyButton }: FoodItemHeaderProps) {
  return (
    <div className="flex">
      {/* //TODO: FoodItem id is random, but it should be an entry on the database (meal too) */}
      {/* <h5 className="mb-2 text-lg font-bold tracking-tight text-white">ID: [{props.FoodItem.id}]</h5> */}
      <div className="my-2">{name}</div>
      <div className={`ml-auto flex gap-2`}>
        <div className="my-auto">{copyButton}</div>
        <div className="my-auto">{favorite}</div>
      </div>
    </div>
  )
}

FoodItemHeader.Name = FoodItemName
FoodItemHeader.CopyButton = FoodItemCopyButton
FoodItemHeader.Favorite = FoodItemFavorite

function FoodItemName() {
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
      {/* //TODO: FoodItem id is random, but it should be an entry on the database (meal too) */}
      {/* <h5 className="mb-2 text-lg font-bold tracking-tight text-white">ID: [{props.FoodItem.id}]</h5> */}
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

function FoodItemCopyButton({
  onCopyItem,
}: {
  onCopyItem: (foodItem: FoodItem) => void
}) {
  const { foodItem: FoodItem } = useFoodItemContext()

  return (
    <div
      className={`btn-ghost btn ml-auto mt-1 px-2 text-white hover:scale-105`}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        onCopyItem(FoodItem)
      }}
    >
      <CopyIcon />
    </div>
  )
}

function FoodItemFavorite({
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

function FoodItemNutritionalInfo() {
  const { foodItem: item } = useFoodItemContext()

  const multipliedMacros: MacroNutrients = {
    carbs: (item.macros.carbs * item.quantity) / 100,
    protein: (item.macros.protein * item.quantity) / 100,
    fat: (item.macros.fat * item.quantity) / 100,
  }

  return (
    <div className="flex">
      <MacroNutrientsView {...multipliedMacros} />
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
