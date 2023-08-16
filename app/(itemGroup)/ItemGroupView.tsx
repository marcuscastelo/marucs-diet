'use client'

import MacroNutrients from '../MacroNutrients'
import { MacroNutrientsData } from '@/model/macroNutrientsModel'
import CopyIcon from '../(icons)/CopyIcon'
import {
  ItemGroupContextProvider,
  useItemGroupContext,
} from './ItemGroupContext'
import { ItemGroup, isSimpleSingleGroup } from '@/model/foodItemGroupModel'
import { calcGroupMacros } from '@/utils/macroMath'
import { useUserContext } from '@/context/users.context'
import { isRecipedGroupUpToDate } from '@/utils/groupUtils'
import { Loadable } from '@/utils/loadable'
import { Recipe } from '@/model/recipeModel'
import { useEffect, useState } from 'react'
import { searchRecipeById } from '@/controllers/recipes'

export type ItemGroupViewProps = {
  itemGroup: ItemGroup
  header?: React.ReactNode
  nutritionalInfo?: React.ReactNode
  className?: string
  onClick?: (foodItemGroup: ItemGroup) => void
}

export default function ItemGroupView({
  itemGroup,
  header,
  nutritionalInfo,
  className,
  onClick,
}: ItemGroupViewProps) {
  const handleClick = (e: React.MouseEvent) => {
    // TODO: Check if parameter is needed (foodItem doesn't seem to be changed)
    onClick?.(itemGroup)
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
      <ItemGroupContextProvider itemGroup={itemGroup}>
        {header}
        {nutritionalInfo}
      </ItemGroupContextProvider>
    </div>
  )
}

ItemGroupView.Header = ItemGroupHeader
ItemGroupView.NutritionalInfo = MealItemNutritionalInfo

export type MealItemHeaderProps = {
  name?: React.ReactNode
  favorite?: React.ReactNode
  copyButton?: React.ReactNode
}

function ItemGroupHeader({ name, favorite, copyButton }: MealItemHeaderProps) {
  return (
    <div className="flex">
      {/* //TODO: mealItem id is random, but it should be an entry on the database (meal too) */}
      {/* <h5 className="mb-2 text-lg font-bold tracking-tight text-white">ID: [{props.mealItem.id}]</h5> */}
      <div className="my-2">{name}</div>
      {/* 
        // TODO: Remove code duplication between FoodItemView and ItemGroupView 
      */}
      <div className={`ml-auto flex gap-2`}>
        <div className="my-auto">{copyButton}</div>
        <div className="my-auto">{favorite}</div>
      </div>
    </div>
  )
}

ItemGroupHeader.Name = ItemGroupName
ItemGroupHeader.CopyButton = ItemGroupCopyButton
ItemGroupHeader.Favorite = ItemGroupFavorite

function ItemGroupName() {
  const { itemGroup } = useItemGroupContext()

  const { debug } = useUserContext()

  const [recipe, setRecipe] = useState<Loadable<Recipe | null>>({
    loading: true,
  })

  useEffect(() => {
    let ignore = false
    if (itemGroup?.type === 'recipe') {
      searchRecipeById(itemGroup.recipe).then((recipe) => {
        if (ignore) return
        setRecipe({ loading: false, errored: false, data: recipe })
      })
    } else {
      setRecipe({ loading: false, errored: false, data: null })
    }
    return () => {
      ignore = true
    }
  }, [itemGroup])

  const getNameColor = () => {
    if (!itemGroup) return 'text-red-900'

    if (recipe.loading) return 'text-green-500 animate-pulse'
    if (recipe.errored) return 'text-red-900'

    if (itemGroup.type === 'simple') {
      if (isSimpleSingleGroup(itemGroup)) {
        return 'text-white'
      } else {
        return 'text-orange-400'
      }
    } else if (itemGroup.type === 'recipe' && recipe.data) {
      if (isRecipedGroupUpToDate(itemGroup, recipe.data)) {
        return 'text-blue-500'
      } else {
        // Strike-through text in red
        const className = 'text-indigo-600 underline decoration-red-500'
        return className
      }
    } else {
      return 'text-red-400'
    }
  }

  return (
    <div className="">
      {/* //TODO: mealItem id is random, but it should be an entry on the database (meal too) */}
      {/* <h5 className="mb-2 text-lg font-bold tracking-tight text-white">ID: [{props.mealItem.id}]</h5> */}
      <h5 className={`mb-2 text-lg font-bold tracking-tight ${getNameColor()}`}>
        {itemGroup?.name ?? 'Erro: grupo sem nome'}{' '}
        {debug && (
          <>
            <div className="text-sm text-gray-400">[ID: {itemGroup?.id}]</div>
          </>
        )}
      </h5>
    </div>
  )
}

function ItemGroupCopyButton({
  handleCopyMealItem,
}: {
  handleCopyMealItem: (mealItem: ItemGroup) => void
}) {
  const { itemGroup } = useItemGroupContext()

  return (
    <div
      className={`btn-ghost btn ml-auto mt-1 px-2 text-white hover:scale-105`}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        itemGroup && handleCopyMealItem(itemGroup)
      }}
    >
      <CopyIcon />
    </div>
  )
}

function ItemGroupFavorite({
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
  const { itemGroup } = useItemGroupContext()

  const multipliedMacros: MacroNutrientsData = (itemGroup &&
    calcGroupMacros(itemGroup)) || {
    carbs: -666,
    protein: -666,
    fat: -666,
  }

  return (
    <div className="flex">
      <MacroNutrients {...multipliedMacros} />
      <div className="ml-auto">
        <span className="text-white"> {itemGroup?.quantity ?? -666}g </span>|
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
