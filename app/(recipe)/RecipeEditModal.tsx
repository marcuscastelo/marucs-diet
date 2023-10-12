'use client'

import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { FoodItem, createFoodItem } from '@/model/foodItemModel'
import Modal, { ModalActions } from '../(modals)/Modal'
import { Recipe, createRecipe } from '@/model/recipeModel'
import RecipeEditView from './RecipeEditView'
import FoodItemEditModal from '../(foodItem)/FoodItemEditModal'
import { ModalContextProvider, useModalContext } from '../(modals)/ModalContext'
import { useConfirmModalContext } from '@/context/confirmModal.context'
import { TemplateItem } from '@/model/templateItemModel'
import { TemplateSearchModal } from '../templateSearch/TemplateSearchModal'
import { ItemGroup, isSimpleSingleGroup } from '@/model/itemGroupModel'
import { RecipeEditor } from '@/utils/data/recipeEditor'

export type RecipeEditModalProps = {
  show?: boolean
  recipe: Recipe | null // TODO: After #159 is done, remove recipe nullability and check if something breaks
  onSaveRecipe: (recipe: Recipe) => void
  onRefetch: () => void
  onCancel?: () => void
  onVisibilityChange?: (isShowing: boolean) => void
}

export function RecipeEditModal({
  recipe: initialRecipe,
  onSaveRecipe,
  onCancel,
  onRefetch,
}: RecipeEditModalProps) {
  const { visible, onSetVisible } = useModalContext()

  const [recipe, setRecipe] = useState<Recipe>(
    initialRecipe ??
      createRecipe({
        name: 'New Recipe',
        items: [],
      }),
  )

  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(
    null,
  )

  const impossibleFoodItem = createFoodItem({
    name: 'IMPOSSIBLE FOOD ITEM',
    reference: 0,
  })

  const [foodItemEditModalVisible, setFoodItemEditModalVisible] =
    useState(false)
  const [templateSearchModalVisible, setTemplateSearchModalVisible] =
    useState(false)

  useEffect(() => {
    if (initialRecipe) {
      setRecipe(initialRecipe)
    }
  }, [initialRecipe])

  useEffect(() => {
    if (selectedFoodItem) {
      setFoodItemEditModalVisible(true)
    } else {
      setFoodItemEditModalVisible(false)
    }
  }, [selectedFoodItem])

  return (
    <>
      <ExternalFoodItemEditModal
        visible={foodItemEditModalVisible}
        onSetVisible={(visible) => {
          if (!visible) {
            setSelectedFoodItem(null)
          }
          setFoodItemEditModalVisible(visible)
        }}
        foodItem={selectedFoodItem ?? impossibleFoodItem}
        targetName={recipe?.name ?? 'LOADING RECIPE'}
        onApply={(foodItem) => {
          if (!recipe) return

          const recipeEditor = new RecipeEditor(recipe)

          const newRecipe = recipeEditor
            .editItem(foodItem.id, (itemEditor) => {
              itemEditor?.setQuantity(foodItem.quantity)
            })
            .finish()

          setRecipe(newRecipe)
          setSelectedFoodItem(null)
        }}
        onDelete={(itemId) => {
          if (!recipe) return

          const recipeEditor = new RecipeEditor(recipe)

          const newRecipe = recipeEditor.deleteItem(itemId).finish()

          setRecipe(newRecipe)
          setSelectedFoodItem(null)
        }}
      />

      <ExternalTemplateSearchModal
        visible={templateSearchModalVisible}
        onSetVisible={setTemplateSearchModalVisible}
        onRefetch={onRefetch}
        recipe={recipe}
        setRecipe={setRecipe}
      />

      <ModalContextProvider visible={visible} onSetVisible={onSetVisible}>
        <Modal
          header={<Header recipe={recipe} />}
          // TODO: Add barcode button and handle barcode scan
          body={
            <Body
              recipe={recipe}
              onSetRecipe={setRecipe}
              onSelectFoodItem={setSelectedFoodItem}
              onSearchNewItem={() => setTemplateSearchModalVisible(true)}
            />
          }
          actions={
            <Actions
              onApply={() => onSaveRecipe(recipe)}
              onCancel={onCancel}
              onDelete={() => alert('TODO: delete recipe')}
            />
          }
        />
      </ModalContextProvider>
    </>
  )
}

function ExternalFoodItemEditModal({
  foodItem,
  targetName,
  onApply,
  onDelete,
  visible,
  onSetVisible,
}: {
  foodItem: FoodItem
  targetName: string
  onApply: (item: TemplateItem) => void
  onDelete: (itemId: TemplateItem['id']) => void
  visible: boolean
  onSetVisible: Dispatch<SetStateAction<boolean>>
}) {
  // TODO: Determine whether to early return from modals in general or just remove all ifs
  if (!visible) return

  return (
    <ModalContextProvider visible={visible} onSetVisible={onSetVisible}>
      <FoodItemEditModal
        foodItem={foodItem}
        targetName={targetName}
        onApply={onApply}
        onDelete={onDelete}
      />
    </ModalContextProvider>
  )
}

// TODO: This component is duplicated between RecipeEditModal and ItemGroupEditModal, must be refactored (maybe global)
function ExternalTemplateSearchModal({
  visible,
  onSetVisible,
  onRefetch,
  recipe,
  setRecipe,
}: {
  visible: boolean
  onSetVisible: Dispatch<SetStateAction<boolean>>
  onRefetch: () => void
  recipe: Recipe
  setRecipe: Dispatch<SetStateAction<Recipe>>
}) {
  const handleNewItemGroup = async (newGroup: ItemGroup) => {
    console.debug('onNewItemGroup', newGroup)

    if (!isSimpleSingleGroup(newGroup)) {
      // TODO: Handle non-simple groups on onNewFoodItem
      console.error('TODO: Handle non-simple groups')
      alert('TODO: Handle non-simple groups') // TODO: Change all alerts with ConfirmModal
      return
    }

    const newRecipe = new RecipeEditor(recipe).addItems(newGroup.items).finish()

    console.debug('onNewFoodItem: applying', JSON.stringify(newRecipe, null, 2))

    setRecipe(newRecipe)
  }

  const handleFinishSearch = () => {
    onSetVisible(false)
    // onRefetch()
  }

  return (
    <ModalContextProvider
      visible={visible}
      onSetVisible={(visible) => {
        // TODO: Implement onClose and onOpen to reduce code duplication
        if (!visible) {
          onRefetch()
        }
        onSetVisible(visible)
      }}
    >
      <TemplateSearchModal
        targetName={recipe?.name ?? 'ERRO: Receita não especificada'}
        onFinish={handleFinishSearch}
        onNewItemGroup={handleNewItemGroup}
      />
    </ModalContextProvider>
  )
}

function Header({ recipe }: { recipe: Recipe | undefined }) {
  return (
    <h3 className="text-lg font-bold text-white">
      Editando receita
      <span className="text-blue-500">
        {' '}
        &quot;
        {recipe?.name ?? 'LOADING RECIPE'}
        &quot;{' '}
      </span>
    </h3>
  )
}

function Body({
  recipe,
  onSetRecipe,
  onSelectFoodItem,
  onSearchNewItem,
}: {
  recipe: Recipe | undefined
  onSetRecipe: Dispatch<SetStateAction<Recipe>>
  onSelectFoodItem: Dispatch<SetStateAction<FoodItem | null>>
  onSearchNewItem: () => void
}) {
  if (!recipe) return null

  return (
    <RecipeEditView
      recipe={recipe}
      header={
        <RecipeEditView.Header
          onUpdateRecipe={(recipe) => {
            onSetRecipe(recipe)
          }}
        />
      }
      content={
        <RecipeEditView.Content
          onNewItem={() => onSearchNewItem()}
          onEditItem={(item) => {
            // TODO: Allow user to edit recipe inside recipe
            if (item.__type === 'RecipeItem') {
              alert(
                'Ainda não é possível editar receitas dentro de receitas! Funcionalidade em desenvolvimento',
              )
              return
            }

            onSelectFoodItem(item)
          }}
        />
      }
    />
  )
}

function Actions({
  onApply,
  onDelete,
  onCancel,
}: {
  onApply: () => void
  onDelete: () => void
  onCancel?: () => void
}) {
  const { onSetVisible } = useModalContext()
  const { show: showConfirmModal } = useConfirmModalContext()

  return (
    <ModalActions>
      <button
        className="btn-error btn mr-auto"
        onClick={(e) => {
          e.preventDefault()

          showConfirmModal({
            title: 'Excluir item',
            body: 'Tem certeza que deseja excluir este item?',
            actions: [
              {
                text: 'Cancelar',
                onClick: () => undefined,
              },
              {
                text: 'Excluir',
                primary: true,
                onClick: () => {
                  onDelete()
                },
              },
            ],
          })
        }}
      >
        Excluir
      </button>
      <button
        className="btn"
        onClick={(e) => {
          e.preventDefault()
          onSetVisible(false)
          onCancel?.()
        }}
      >
        Cancelar
      </button>
      <button
        className="btn"
        onClick={(e) => {
          e.preventDefault()
          onApply()
          onSetVisible(false)
        }}
      >
        Aplicar
      </button>
    </ModalActions>
  )
}
