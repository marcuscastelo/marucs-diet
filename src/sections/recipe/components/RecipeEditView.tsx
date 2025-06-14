// TODO:   Unify Recipe and Recipe components into a single component?

import { type Accessor, type JSXElement, type Setter } from 'solid-js'

import { itemSchema } from '~/modules/diet/item/domain/item'
import {
  convertToGroups,
  type GroupConvertible,
} from '~/modules/diet/item-group/application/itemGroupService'
import { itemGroupSchema } from '~/modules/diet/item-group/domain/itemGroup'
import { mealSchema } from '~/modules/diet/meal/domain/meal'
import { type Recipe, recipeSchema } from '~/modules/diet/recipe/domain/recipe'
import {
  addItemsToRecipe,
  clearRecipeItems,
  updateRecipeName,
  updateRecipePreparedMultiplier,
} from '~/modules/diet/recipe/domain/recipeOperations'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { ClipboardActionButtons } from '~/sections/common/components/ClipboardActionButtons'
import { FloatInput } from '~/sections/common/components/FloatInput'
import { PreparedQuantity } from '~/sections/common/components/PreparedQuantity'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { useCopyPasteActions } from '~/sections/common/hooks/useCopyPasteActions'
import { useFloatField } from '~/sections/common/hooks/useField'
import { ItemListView } from '~/sections/food-item/components/ItemListView'
import {
  RecipeEditContextProvider,
  useRecipeEditContext,
} from '~/sections/recipe/context/RecipeEditContext'
import { cn } from '~/shared/cn'
import { regenerateId } from '~/shared/utils/idUtils'
import { calcRecipeCalories } from '~/shared/utils/macroMath'

export type RecipeEditViewProps = {
  recipe: Accessor<Recipe>
  setRecipe: Setter<Recipe>
  header?: JSXElement
  content?: JSXElement
  footer?: JSXElement
  className?: string
}

// TODO:   Reenable drag and drop
// a little function to help us with reordering the result
// const reorder = (list: unknown[], startIndex: number, endIndex: number) => {
//   const result = Array.from(list)
//   const [removed] = result.splice(startIndex, 1)
//   result.splice(endIndex, 0, removed)

//   return result
// }

export default function RecipeEditView(props: RecipeEditViewProps) {
  // TODO:   implement setRecipe
  return (
    <div class={cn('p-3', props.className)}>
      <RecipeEditContextProvider
        recipe={props.recipe}
        setRecipe={props.setRecipe}
      >
        {props.header}
        {props.content}
        {props.footer}
      </RecipeEditContextProvider>
    </div>
  )
}

export function RecipeEditHeader(props: {
  onUpdateRecipe: (Recipe: Recipe) => void
}) {
  const { show: showConfirmModal } = useConfirmModalContext()

  const acceptedClipboardSchema = mealSchema
    .or(itemGroupSchema)
    .or(itemSchema)
    .or(recipeSchema)

  const { recipe } = useRecipeEditContext()

  const { handleCopy, handlePaste, hasValidPastableOnClipboard } =
    useCopyPasteActions({
      acceptedClipboardSchema,
      getDataToCopy: () => recipe(),
      onPaste: (data) => {
        const groupsToAdd = convertToGroups(data as GroupConvertible)
          .map((group) => regenerateId(group))
          .map((g) => ({
            ...g,
            items: g.items.map((item) => regenerateId(item)),
          }))
        const itemsToAdd = groupsToAdd.flatMap((g) => g.items)
        const newRecipe = addItemsToRecipe(recipe(), itemsToAdd)
        props.onUpdateRecipe(newRecipe)
      },
    })

  const recipeCalories = calcRecipeCalories(recipe())

  const onClearItems = (e: MouseEvent) => {
    e.preventDefault()
    showConfirmModal({
      title: 'Limpar itens',
      body: 'Tem certeza que deseja limpar os itens?',
      actions: [
        { text: 'Cancelar', onClick: () => undefined },
        {
          text: 'Excluir todos os itens',
          primary: true,
          onClick: () => {
            const newRecipe = clearRecipeItems(recipe())
            props.onUpdateRecipe(newRecipe)
          },
        },
      ],
    })
  }

  return (
    <div class="flex">
      <div class="my-2">
        <h5 class="text-3xl text-blue-500">{recipe().name}</h5>
        <p class="italic text-gray-400">{recipeCalories.toFixed(0)}kcal</p>
      </div>
      <ClipboardActionButtons
        canCopy={!hasValidPastableOnClipboard() && recipe().items.length > 0}
        canPaste={hasValidPastableOnClipboard()}
        canClear={recipe().items.length > 0}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onClear={onClearItems}
      />
    </div>
  )
}

export function RecipeEditContent(props: {
  onEditItem: (item: TemplateItem) => void
  onNewItem: () => void
}) {
  const { recipe, setRecipe } = useRecipeEditContext()

  return (
    <>
      <input
        class="input w-full"
        type="text"
        onChange={(e) => {
          setRecipe(updateRecipeName(recipe(), e.target.value))
        }}
        onFocus={(e) => {
          e.target.select()
        }}
        value={recipe().name}
      />
      <ItemListView
        items={() => recipe().items}
        onItemClick={props.onEditItem}
      />
      <AddNewItemButton onClick={props.onNewItem} />
      <div class="flex justify-between gap-2 mt-2">
        <div class="flex flex-col">
          <RawQuantity />
          <div class="text-gray-400 ml-1">Peso (cru)</div>
        </div>
        <div class="flex flex-col">
          <PreparedQuantity
            rawQuantity={recipe().items.reduce(
              (acc, item) => acc + item.quantity,
              0,
            )}
            preparedMultiplier={recipe().prepared_multiplier}
            onPreparedQuantityChange={({ newMultiplier }) => {
              const newRecipe = updateRecipePreparedMultiplier(
                recipe(),
                newMultiplier(),
              )

              setRecipe(newRecipe)
            }}
          />
          <div class="text-gray-400 ml-1">Peso (pronto)</div>
        </div>
        <div class="flex flex-col">
          <PreparedMultiplier />
          <div class="text-gray-400 ml-1">Mult.</div>
        </div>
      </div>
    </>
  )
}

function AddNewItemButton(props: { onClick: () => void }) {
  return (
    <button
      class="mt-3 min-w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
      onClick={() => {
        props.onClick()
      }}
    >
      Adicionar item
    </button>
  )
}

function RawQuantity() {
  const { recipe } = useRecipeEditContext()

  const rawQuantity = () =>
    recipe().items.reduce((acc, item) => {
      return acc + item.quantity
    }, 0)

  const rawQuantityField = useFloatField(rawQuantity, {
    decimalPlaces: 0,
  })

  return (
    <div class="flex gap-2">
      <FloatInput
        field={rawQuantityField}
        disabled
        class="input px-0 pl-5 text-md"
        style={{ width: '100%' }}
      />
    </div>
  )
}

function PreparedMultiplier() {
  const { recipe, setRecipe } = useRecipeEditContext()

  const preparedMultiplier = () => recipe().prepared_multiplier

  const preparedMultiplierField = useFloatField(preparedMultiplier, {
    decimalPlaces: 2,
  })

  return (
    <div class="flex gap-2">
      <FloatInput
        field={preparedMultiplierField}
        commitOn="change"
        class="input px-0 pl-5 text-md"
        onFocus={(event) => {
          event.target.select()
        }}
        onFieldCommit={(newMultiplier) => {
          const newRecipe = updateRecipePreparedMultiplier(
            recipe(),
            newMultiplier ?? 1,
          )

          setRecipe(newRecipe)
        }}
        style={{ width: '100%' }}
      />
    </div>
  )
}
