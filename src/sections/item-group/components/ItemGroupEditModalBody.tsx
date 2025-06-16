import { type Accessor, batch, type Setter, Show } from 'solid-js'

import { type Item } from '~/modules/diet/item/domain/item'
import { removeItemFromGroup } from '~/modules/diet/item-group/domain/itemGroupOperations'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import {
  isTemplateItemFood,
  isTemplateItemRecipe,
} from '~/modules/diet/template-item/domain/templateItem'
import { showError } from '~/modules/toast/application/toastManager'
import { HeaderWithActions } from '~/sections/common/components/HeaderWithActions'
import { useConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { ItemListView } from '~/sections/food-item/components/ItemListView'
import {
  ItemCopyButton,
  ItemFavorite,
  ItemName,
} from '~/sections/food-item/components/ItemView'
import { useItemGroupEditContext } from '~/sections/item-group/context/ItemGroupEditContext'

/**
 * Body component for ItemGroupEditModal content.
 * @param props - Body props
 * @returns JSX.Element
 */
export function ItemGroupEditModalBody(props: {
  recipe: Accessor<Recipe | null>
  recipeEditModalVisible: Accessor<boolean>
  setRecipeEditModalVisible: Setter<boolean>
  itemEditModalVisible: Accessor<boolean>
  setItemEditModalVisible: Setter<boolean>
  templateSearchModalVisible: Accessor<boolean>
  setTemplateSearchModalVisible: Setter<boolean>
  mode?: 'edit' | 'read-only' | 'summary'
  writeToClipboard: (text: string) => void
  setEditSelection: (sel: { item: Item } | null) => void
}) {
  const { group, setGroup } = useItemGroupEditContext()
  const { show: showConfirmModal } = useConfirmModalContext()

  return (
    <Show when={group()}>
      {(group) => (
        <>
          <ItemListView
            items={() => group().items}
            mode={props.mode}
            makeHeaderFn={(item) => (
              <HeaderWithActions
                name={<ItemName />}
                primaryActions={
                  props.mode === 'edit' ? (
                    <>
                      <ItemFavorite foodId={item.reference} />
                    </>
                  ) : null
                }
              />
            )}
            handlers={{
              onEdit: (item) => {
                if (!isTemplateItemFood(item)) {
                  showError('Item não é um alimento válido para edição.')
                  return
                }
                props.setItemEditModalVisible(true)
                props.setEditSelection({ item })
              },
              onCopy: (item) => {
                props.writeToClipboard(JSON.stringify(item))
              },
              onDelete: (item) => {
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
                        setGroup((prev) => removeItemFromGroup(prev, item.id))
                      },
                    },
                  ],
                })
              },
            }}
          />
          {props.mode === 'edit' && (
            <button
              class="mt-3 min-w-full rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
              onClick={() => {
                props.setTemplateSearchModalVisible(true)
              }}
            >
              Adicionar item
            </button>
          )}
        </>
      )}
    </Show>
  )
}
