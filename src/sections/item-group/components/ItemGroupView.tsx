'use client'

import MacroNutrientsView from '@/src/sections/macro-nutrients/components/MacroNutrientsView'
import { MacroNutrients } from '@/src/modules/diet/macro-nutrients/domain/macroNutrients'
import CopyIcon from '@/sections/common/components/icons/CopyIcon'
import {
  ItemGroup,
  isSimpleSingleGroup,
} from '@/modules/diet/item-group/domain/itemGroup'
import { calcGroupCalories, calcGroupMacros } from '@/legacy/utils/macroMath'
import { useUserContext } from '@/sections/user/context/UserContext'
import { isRecipedGroupUpToDate } from '@/legacy/utils/groupUtils'
import { Loadable } from '@/legacy/utils/loadable'
import { Recipe } from '@/src/modules/diet/recipe/domain/recipe'
import { useState } from 'react'
import { searchRecipeById } from '@/legacy/controllers/recipes'
import {
  ReadonlySignal,
  computed,
  useSignalEffect,
} from '@preact/signals-react'

export type ItemGroupViewProps = {
  itemGroup: ReadonlySignal<ItemGroup>
  header?: React.ReactNode
  nutritionalInfo?: React.ReactNode
  className?: string
  onClick?: (itemGroup: ItemGroup) => void
}

export default function ItemGroupView({
  itemGroup,
  header,
  nutritionalInfo,
  className,
  onClick,
}: ItemGroupViewProps) {
  const handleClick = (e: React.MouseEvent) => {
    onClick?.(itemGroup.value)
    e.stopPropagation()
    e.preventDefault()
  }
  console.debug(`[ItemGroupView] - Rendering`)

  return (
    <div
      className={`meal-item block rounded-lg border border-gray-700 bg-gray-700 p-3 shadow hover:cursor-pointer hover:bg-gray-700 ${
        className ?? ''
      }`}
      onClick={handleClick}
    >
      {header}
      {nutritionalInfo}
    </div>
  )
}

ItemGroupView.Header = ItemGroupHeader
ItemGroupView.NutritionalInfo = ItemGroupViewNutritionalInfo

export type ItemGroupViewHeaderProps = {
  name?: React.ReactNode
  favorite?: React.ReactNode
  copyButton?: React.ReactNode
}

function ItemGroupHeader({
  name,
  favorite,
  copyButton,
}: ItemGroupViewHeaderProps) {
  return (
    <div className="flex">
      {/* //TODO: ItemGroupView id is random, but it should be an entry on the database (meal too) */}
      {/* <h5 className="mb-2 text-lg font-bold tracking-tight text-white">ID: [{props.ItemGroupView.id}]</h5> */}
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

function ItemGroupName({
  group: itemGroup,
}: {
  group: ReadonlySignal<ItemGroup>
}) {
  const { debug } = useUserContext()

  const [recipe, setRecipe] = useState<Loadable<Recipe | null>>({
    loading: true,
  })

  useSignalEffect(() => {
    console.debug(`[ItemGroupName] item changed, fetching API:`, itemGroup)
    if (itemGroup.value?.type === 'recipe') {
      searchRecipeById(itemGroup.value.recipe).then((recipe) => {
        setRecipe({ loading: false, errored: false, data: recipe })
      })
    } else {
      setRecipe({ loading: false, errored: false, data: null })
    }
  })

  const nameColor = computed(() => {
    if (itemGroup.value === null) {
      console.error(`[ItemGroupName] item is null!!`)
      return 'text-red-900 bg-red-200'
    }

    if (recipe.loading) return 'text-gray-500 animate-pulse'
    if (recipe.errored) {
      console.error(`[ItemGroupName] recipe errored!!`)
      return 'text-red-900 bg-red-200 bg-opacity-50'
    }

    if (itemGroup.value.type === 'simple') {
      if (isSimpleSingleGroup(itemGroup.value)) {
        return 'text-white'
      } else {
        return 'text-orange-400'
      }
    } else if (itemGroup.value.type === 'recipe' && recipe.data) {
      if (isRecipedGroupUpToDate(itemGroup.value, recipe.data)) {
        return 'text-yellow-200'
      } else {
        // Strike-through text in red
        const className = 'text-yellow-200 underline decoration-red-500'
        return className
      }
    } else {
      console.error(
        `[ItemGroupName] item is not simple or recipe!! Item:`,
        itemGroup.value,
      )
      return 'text-red-400'
    }
  })

  return (
    <div className="">
      {/* 
        //TODO: ItemGroupView id is random, but it should be an entry on the database (meal too) 
      */}
      {/* <h5 className="mb-2 text-lg font-bold tracking-tight text-white">ID: [{props.ItemGroupView.id}]</h5> */}
      <h5 className={`mb-2 text-lg font-bold tracking-tight ${nameColor}`}>
        {itemGroup.value?.name ?? 'Erro: grupo sem nome'}{' '}
        {debug && (
          <>
            <div className="text-sm text-gray-400">
              [ID: {itemGroup.value?.id}]
            </div>
          </>
        )}
      </h5>
    </div>
  )
}

function ItemGroupCopyButton({
  onCopyItemGroup,
  group: itemGroup,
}: {
  onCopyItemGroup: (itemGroup: ItemGroup) => void
  group: ReadonlySignal<ItemGroup>
}) {
  return (
    <div
      className={`btn-ghost btn ml-auto mt-1 px-2 text-white hover:scale-105`}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        itemGroup.value && onCopyItemGroup(itemGroup.value)
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

function ItemGroupViewNutritionalInfo({
  group: itemGroup,
}: {
  group: ReadonlySignal<ItemGroup>
}) {
  console.debug(`[ItemGroupViewNutritionalInfo] - Rendering`)
  console.debug(`[ItemGroupViewNutritionalInfo] - itemGroup:`, itemGroup)

  const multipliedMacros: MacroNutrients = (itemGroup.value &&
    calcGroupMacros(itemGroup.value)) ?? {
    carbs: -666,
    protein: -666,
    fat: -666,
  }

  return (
    <div className="flex">
      <MacroNutrientsView {...multipliedMacros} />
      <div className="ml-auto">
        <span className="text-white">
          {' '}
          {itemGroup.value?.quantity ?? -666}g{' '}
        </span>
        |
        <span className="text-white">
          {' '}
          {itemGroup.value && calcGroupCalories(itemGroup.value).toFixed(0)}
          kcal{' '}
        </span>
      </div>
    </div>
  )
}
