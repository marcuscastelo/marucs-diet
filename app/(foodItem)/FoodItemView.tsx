'use client'

import MacroNutrientsView from '../MacroNutrientsView'
import { MacroNutrients } from '@/model/macroNutrientsModel'
import { FoodItemContextProvider, useFoodItemContext } from './FoodItemContext'
import CopyIcon from '../(icons)/CopyIcon'
import { searchFoodById } from '@/controllers/food'
import { calcItemCalories } from '@/utils/macroMath'
import { useUserContext } from '@/context/users.context'
import { searchRecipeById } from '@/controllers/recipes'
import { TemplateItem } from '@/model/templateItemModel'
import { Template } from '@/model/templateModel'
import {
  ReadonlySignal,
  computed,
  useSignal,
  useSignalEffect,
} from '@preact/signals-react'

export type FoodItemViewProps = {
  foodItem: ReadonlySignal<TemplateItem>
  header?: React.ReactNode
  nutritionalInfo?: React.ReactNode
  className?: string
  onClick?: (foodItem: TemplateItem) => void
}

export default function FoodItemView({
  foodItem,
  header,
  nutritionalInfo,
  className,
  onClick,
}: FoodItemViewProps) {
  const handleClick = (e: React.MouseEvent) => {
    onClick?.(foodItem.value)
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

  const template = useSignal<Template | null>(null)

  useSignalEffect(() => {
    console.debug(`[FoodItemName] item changed, fetching API:`, item.value)

    const itemValue = item.value
    if (itemValue === undefined) {
      console.warn(`[FoodItemName] item is undefined!!`)
      return // TODO: Remove serverActions: causing bugs with signals
    }

    if (itemValue.__type === 'RecipeItem') {
      searchRecipeById(itemValue.reference).then(
        (recipe) => (template.value = recipe),
      )
    } else {
      searchFoodById(itemValue.reference).then(
        (food) => (template.value = food),
      )
    }
  })

  const templateNameColor = computed(() => {
    if (item.value?.__type === 'FoodItem') {
      return 'text-white'
    } else if (item.value.__type === 'RecipeItem') {
      return 'text-blue-500'
    } else {
      return 'text-red-500'
    }
  })

  return (
    <div className="">
      {/* //TODO: FoodItem id is random, but it should be an entry on the database (meal too) */}
      {/* <h5 className="mb-2 text-lg font-bold tracking-tight text-white">ID: [{props.FoodItem.id}]</h5> */}
      <h5
        className={`mb-2 text-lg font-bold tracking-tight ${templateNameColor.value}`}
      >
        {template.value?.name ?? 'food not found'}{' '}
        {debug && (
          <>
            <div className="text-sm text-gray-400">[ID: {item.value?.id}]</div>
            <div className="text-sm text-gray-400">
              [ID: {template.value?.id}]
            </div>
          </>
        )}
      </h5>
    </div>
  )
}

function FoodItemCopyButton({
  onCopyItem,
}: {
  onCopyItem: (foodItem: TemplateItem) => void
}) {
  const { foodItem } = useFoodItemContext()

  return (
    <div
      className={`btn-ghost btn ml-auto mt-1 px-2 text-white hover:scale-105`}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        onCopyItem(foodItem.value)
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
    carbs: (item.value.macros.carbs * item.value.quantity) / 100,
    protein: (item.value.macros.protein * item.value.quantity) / 100,
    fat: (item.value.macros.fat * item.value.quantity) / 100,
  }

  return (
    <div className="flex">
      <MacroNutrientsView {...multipliedMacros} />
      <div className="ml-auto">
        <span className="text-white"> {item.value.quantity}g </span>|
        <span className="text-white">
          {' '}
          {calcItemCalories(item.value).toFixed(0)}
          kcal{' '}
        </span>
      </div>
    </div>
  )
}
