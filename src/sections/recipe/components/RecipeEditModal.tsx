import {
  type Item,
  createItem,
} from '~/modules/diet/item/domain/item'
import { Modal, ModalActions } from '~/sections/common/components/Modal'
import { type Recipe, createRecipe } from '~/modules/diet/recipe/domain/recipe'
import RecipeEditView, {
  RecipeEditContent,
  RecipeEditHeader,
} from '~/sections/recipe/components/RecipeEditView'
import { ItemEditModal } from '~/sections/food-item/components/ItemEditModal'
import {
  ModalContextProvider,
  useModalContext,
} from '~/sections/common/context/ModalContext'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { type TemplateItem } from '~/modules/diet/template-item/domain/templateItem'
import { ExternalTemplateSearchModal } from '~/sections/search/components/ExternalTemplateSearchModal'
import { ExternalItemEditModal } from '~/sections/food-item/components/ExternalItemEditModal'
import { TemplateSearchModal } from '~/sections/search/components/TemplateSearchModal'
import {
  type ItemGroup,
  isSimpleSingleGroup,
} from '~/modules/diet/item-group/domain/itemGroup'
import { RecipeEditor } from '~/legacy/utils/data/recipeEditor'
import toast from 'solid-toast'

import { currentUserId } from '~/modules/user/application/user'
import {
  type Accessor,
  createEffect,
  createSignal,
  type Setter,
  Show,
} from 'solid-js'
import { createMirrorSignal } from '~/sections/common/hooks/createMirrorSignal'

export type RecipeEditModalProps = {
  show?: boolean
  recipe: Recipe | null // TODO: After #159 is done, remove recipe nullability and check if something breaks
  onSaveRecipe: (recipe: Recipe) => void
  onRefetch: () => void
  onCancel?: () => void
  onDelete: (recipeId: Recipe['id']) => void
  onVisibilityChange?: (isShowing: boolean) => void
}

export function RecipeEditModal(props: RecipeEditModalProps) {
  const { visible, setVisible } = useModalContext()
  const userId = currentUserId()

  const [recipe, setRecipe] = createMirrorSignal(
    () =>
      props.recipe ??
      createRecipe({
        name: 'New Recipe',
        items: [],
        owner: userId,
      }),
  )

  const [selectedItem, setSelectedItem] = createSignal<Item | null>(
    null,
  )

  const impossibleItem = createItem({
    name: 'IMPOSSIBLE ITEM',
    reference: 0,
  })

  const [itemEditModalVisible, setItemEditModalVisible] =
    createSignal(false)
  const [templateSearchModalVisible, setTemplateSearchModalVisible] =
    createSignal(false)

  const handleNewItemGroup = (newGroup: ItemGroup) => {
    console.debug('onNewItemGroup', newGroup)

    if (!isSimpleSingleGroup(newGroup)) {
      // TODO: Handle non-simple groups on handleNewItemGroup
      console.error('TODO: Handle non-simple groups')
      toast.error(
        'Não é possível adicionar grupos complexos a receitas, por enquanto.',
      )
      return
    }

    const newRecipe = new RecipeEditor(recipe())
      .addItems(newGroup.items)
      .finish()

    console.debug('handleNewItemGroup: applying', JSON.stringify(newRecipe, null, 2))

    setRecipe(newRecipe)
  }

  createEffect(() => {
    // TODO: Replace itemEditModalVisible with a derived signal
    setItemEditModalVisible(selectedItem() !== null)
  })

  createEffect(() => {
    if (!itemEditModalVisible()) {
      setSelectedItem(null)
    }
  })

  return (
    <>
      <ExternalItemEditModal
        visible={itemEditModalVisible}
        setVisible={setItemEditModalVisible}
        item={() => selectedItem() ?? impossibleItem}
        targetName={recipe()?.name ?? 'LOADING RECIPE'}
        onApply={(item) => {
          if (recipe() === null) return

          const recipeEditor = new RecipeEditor(recipe())

          const newRecipe = recipeEditor
            .editItem(item.id, (itemEditor) => {
              itemEditor?.setQuantity(item.quantity)
            })
            .finish()

          setRecipe(newRecipe)
          setSelectedItem(null)
        }}
        onDelete={(itemId) => {
          const recipeEditor = new RecipeEditor(recipe())

          const newRecipe = recipeEditor.deleteItem(itemId).finish()

          setRecipe(newRecipe)
          setSelectedItem(null)
        }}
      />

      <ExternalTemplateSearchModal
        visible={templateSearchModalVisible}
        setVisible={setTemplateSearchModalVisible}
        onRefetch={props.onRefetch}
        targetName={recipe()?.name ?? 'ERRO: Receita não especificada'}
        onNewItemGroup={handleNewItemGroup}
      />

      <ModalContextProvider visible={visible} setVisible={setVisible}>
        <Modal
          class="border-2 border-cyan-600"
          // TODO: Add barcode button and handle barcode scan
          body={
            <Body
              recipe={recipe}
              setRecipe={setRecipe}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              onSearchNewItem={() => setTemplateSearchModalVisible(true)}
            />
          }
          actions={
            <Actions
              onApply={() => {
                props.onSaveRecipe(recipe())
              }}
              onCancel={props.onCancel}
              onDelete={() => {
                props.onDelete(recipe().id)
              }}
            />
          }
        />
      </ModalContextProvider>
    </>
  )
}

function Body(props: {
  recipe: Accessor<Recipe>
  setRecipe: Setter<Recipe>
  selectedItem: Accessor<Item | null>
  setSelectedItem: Setter<Item | null>
  onSearchNewItem: () => void
}) {
  return (
    <RecipeEditView
      recipe={props.recipe}
      setRecipe={props.setRecipe}
      header={
        <RecipeEditHeader
          onUpdateRecipe={(newRecipe) => {
            console.debug('[RecipeEditModal] onUpdateRecipe: ', newRecipe)
            props.setRecipe(newRecipe)
          }}
        />
      }
      content={
        <RecipeEditContent
          onNewItem={() => {
            props.onSearchNewItem()
          }}
          onEditItem={(item) => {
            // TODO: Allow user to edit recipe inside recipe
            if (item.__type === 'RecipeItem') {
              toast.error(
                'Ainda não é possível editar receitas dentro de receitas! Funcionalidade em desenvolvimento',
              )
              return
            }

            props.setSelectedItem(item)
          }}
        />
      }
    />
  )
}

function Actions(props: {
  onApply: () => void
  onDelete: () => void
  onCancel?: () => void
}) {
  const { setVisible } = useModalContext()
  const { show: showConfirmModal } = useConfirmModalContext()

  return (
    <ModalActions>
      <button
        class="btn-error btn mr-auto"
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
                  props.onDelete()
                },
              },
            ],
          })
        }}
      >
        Excluir
      </button>
      <button
        class="btn"
        onClick={(e) => {
          e.preventDefault()
          setVisible(false)
          props.onCancel?.()
        }}
      >
        Cancelar
      </button>
      <button
        class="btn"
        onClick={(e) => {
          e.preventDefault()
          props.onApply()
          setVisible(false)
        }}
      >
        Aplicar
      </button>
    </ModalActions>
  )
}
