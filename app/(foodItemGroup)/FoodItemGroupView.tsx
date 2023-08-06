'use client'

import MacroNutrients from '../MacroNutrients'
import { MacroNutrientsData } from '@/model/macroNutrientsModel'
import CopyIcon from '../(icons)/CopyIcon'
import {
  FoodItemGroupContextProvider,
  useFoodItemGroupContext,
} from './FoodItemGroupContext'
import { FoodItemGroup, isGroupSingleItem } from '@/model/foodItemGroupModel'
import { calcGroupMacros } from '@/utils/macroMath'

export type FoodItemGroupViewProps = {
  foodItemGroup: FoodItemGroup
  header?: React.ReactNode
  nutritionalInfo?: React.ReactNode
  className?: string
  onClick?: (foodItemGroup: FoodItemGroup) => void
}

export default function FoodItemGroupView({
  foodItemGroup,
  header,
  nutritionalInfo,
  className,
  onClick,
}: FoodItemGroupViewProps) {
  const handleClick = (e: React.MouseEvent) => {
    // TODO: Check if parameter is needed (foodItem doesn't seem to be changed)
    onClick?.(foodItemGroup)
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
      <FoodItemGroupContextProvider foodItemGroup={foodItemGroup}>
        {header}
        {nutritionalInfo}
      </FoodItemGroupContextProvider>
    </div>
  )
}

FoodItemGroupView.Header = MealItemHeader
FoodItemGroupView.NutritionalInfo = MealItemNutritionalInfo

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

function MealItemName({ debug = true }: { debug?: boolean }) {
  const { foodItemGroup: itemGroup } = useFoodItemGroupContext()

  const getNameColor = () => {
    if (itemGroup.type === 'simple') {
      if (isGroupSingleItem(itemGroup)) {
        return 'text-white'
      } else {
        return 'text-orange-400'
      }
    } else if (itemGroup.type === 'recipe') {
      return 'text-green-400'
    } else {
      return 'text-red-400'
    }
  }

  return (
    <div className="">
      {/* //TODO: mealItem id is random, but it should be an entry on the database (meal too) */}
      {/* <h5 className="mb-2 text-lg font-bold tracking-tight text-white">ID: [{props.mealItem.id}]</h5> */}
      <h5 className={`mb-2 text-lg font-bold tracking-tight ${getNameColor()}`}>
        {itemGroup.name}{' '}
        {debug && (
          <>
            <div className="text-sm text-gray-400">[ID: {itemGroup?.id}]</div>
          </>
        )}
      </h5>
    </div>
  )
}

function MealItemCopyButton({
  handleCopyMealItem,
}: {
  handleCopyMealItem: (mealItem: FoodItemGroup) => void
}) {
  const { foodItemGroup: itemGroup } = useFoodItemGroupContext()

  return (
    <div
      className={`btn-ghost btn ml-auto mt-1 px-2 text-white hover:scale-105`}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        handleCopyMealItem(itemGroup)
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
  const { foodItemGroup: itemGroup } = useFoodItemGroupContext()

  const multipliedMacros: MacroNutrientsData = calcGroupMacros(itemGroup)

  return (
    <div className="flex">
      <MacroNutrients {...multipliedMacros} />
      <div className="ml-auto">
        <span className="text-white"> {itemGroup.quantity}g </span>|
        <span className="text-white">
          {' '}
          {/* // TODO: Calculate calories for itemgroup */}
          {/* {calculateCalories({
            carbs: (itemGroup.macros.carbs * itemGroup.quantity) / 100,
            protein: (itemGroup.macros.protein * itemGroup.quantity) / 100,
            fat: (itemGroup.macros.fat * itemGroup.quantity) / 100,
          }).toFixed(0)} */}
          kcal{' '}
        </span>
      </div>
    </div>
  )
}
