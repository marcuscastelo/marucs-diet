import { type Accessor, batch, type Setter, Show } from 'solid-js'

import { type Item } from '~/modules/diet/item/domain/item'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { isTemplateItemRecipe } from '~/modules/diet/template-item/domain/templateItem'
import { showError } from '~/modules/toast/application/toastManager'
import { HeaderWithActions } from '~/sections/common/components/HeaderWithActions'
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
  const { group } = useItemGroupEditContext()

  function handleItemClick(item: Item) {
    if (props.mode !== 'edit') return
    if (isTemplateItemRecipe(item)) {
      // TODO: Allow user to edit recipe
      showError(
        'Ainda não é possível editar receitas! Funcionalidade em desenvolvimento',
      )
      return
    }
    batch(() => {
      props.setEditSelection({ item })
      props.setItemEditModalVisible(true)
    })
  }

  return (
    <Show when={group()}>
      {(group) => (
        <>
          <div class="text-md mt-4">
            <div class="flex gap-4">
              <div class="my-auto flex-1" />
            </div>
          </div>
          <ItemListView
            items={() => group().items}
            onItemClick={
              props.mode === 'edit'
                ? (item) => handleItemClick(item as Item)
                : undefined
            }
            mode={props.mode}
            makeHeaderFn={(item) => (
              <HeaderWithActions
                name={<ItemName />}
                primaryActions={
                  props.mode === 'edit' ? (
                    <>
                      <ItemCopyButton
                        onCopyItem={(item) => {
                          props.writeToClipboard(JSON.stringify(item))
                        }}
                      />
                      <ItemFavorite foodId={item.reference} />
                    </>
                  ) : null
                }
              />
            )}
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
