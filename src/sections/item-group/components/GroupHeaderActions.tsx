import { type Accessor, type Setter, Show } from 'solid-js'

import { deepCopy } from '~/legacy/utils/deepCopy'
import {
  isRecipedGroupUpToDate,
  isRecipedItemGroup,
  isSimpleItemGroup,
  type ItemGroup,
} from '~/modules/diet/item-group/domain/itemGroup'
import {
  setItemGroupItems,
  setItemGroupRecipe,
} from '~/modules/diet/item-group/domain/itemGroupOperations'
import { insertRecipe } from '~/modules/diet/recipe/application/recipe'
import {
  createNewRecipe,
  type Recipe,
} from '~/modules/diet/recipe/domain/recipe'
import { showError } from '~/modules/toast/application/toastManager'
import { currentUserId } from '~/modules/user/application/user'
import { BrokenLink } from '~/sections/common/components/icons/BrokenLinkIcon'
import { ConvertToRecipeIcon } from '~/sections/common/components/icons/ConvertToRecipeIcon'
import { DownloadIcon } from '~/sections/common/components/icons/DownloadIcon'
import { PasteIcon } from '~/sections/common/components/icons/PasteIcon'
import { RecipeIcon } from '~/sections/common/components/icons/RecipeIcon'
import { type ConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { askUnlinkRecipe } from '~/sections/item-group/components/itemGroupModals'
import { formatError } from '~/shared/formatError'

// Helper for recipe complexity
function isRecipeTooComplex(recipe: Recipe | null) {
  return recipe !== null && recipe.prepared_multiplier !== 1
}

export function GroupHeaderActions(props: {
  group: Accessor<ItemGroup>
  setGroup: Setter<ItemGroup>
  mode?: 'edit' | 'read-only' | 'summary'
  recipe: Recipe | null
  hasValidPastableOnClipboard: () => boolean
  handlePaste: () => void
  setRecipeEditModalVisible: Setter<boolean>
  showConfirmModal: ConfirmModalContext['show']
}) {
  return (
    <Show when={props.mode === 'edit'}>
      <div class="flex gap-2 ml-4">
        <Show when={props.hasValidPastableOnClipboard()}>
          <button
            class="btn-ghost btn cursor-pointer uppercase px-2 text-white hover:scale-105"
            onClick={() => {
              if (isRecipeTooComplex(props.recipe)) {
                showError(
                  'Os itens desse grupo não podem ser editados. Motivo: a receita é muito complexa, ainda não é possível editar receitas complexas',
                )
                return
              }
              props.handlePaste()
            }}
          >
            <PasteIcon />
          </button>
        </Show>
        <Show when={isSimpleItemGroup(props.group())}>
          <button
            class="my-auto"
            onClick={() => {
              const exec = async () => {
                const newRecipe = createNewRecipe({
                  name:
                    props.group().name.length > 0
                      ? props.group().name
                      : 'Nova receita (a partir de um grupo)',
                  items: deepCopy(props.group().items) ?? [],
                  owner: currentUserId(),
                })
                const insertedRecipe = await insertRecipe(newRecipe)
                if (insertedRecipe === null) return
                props.setGroup(
                  setItemGroupRecipe(props.group(), insertedRecipe.id),
                )
                props.setRecipeEditModalVisible(true)
              }
              exec().catch((err) => {
                showError(
                  `Falha ao criar receita a partir de grupo: ${formatError(err)}`,
                )
              })
            }}
          >
            <ConvertToRecipeIcon />
          </button>
        </Show>
        <Show
          when={(() => {
            const group_ = props.group()
            return isRecipedItemGroup(group_) && group_
          })()}
        >
          {(group) => (
            <>
              <Show when={props.recipe}>
                {(recipe) => (
                  <>
                    <Show when={isRecipedGroupUpToDate(group(), recipe())}>
                      <button
                        class="my-auto"
                        onClick={() => {
                          props.setRecipeEditModalVisible(true)
                        }}
                      >
                        <RecipeIcon />
                      </button>
                    </Show>
                    <Show when={!isRecipedGroupUpToDate(group(), recipe())}>
                      <button
                        class="my-auto hover:animate-pulse"
                        onClick={() => {
                          if (!props.recipe) return
                          const newGroup = setItemGroupItems(
                            group(),
                            props.recipe.items,
                          )
                          props.setGroup(newGroup)
                        }}
                      >
                        <DownloadIcon />
                      </button>
                    </Show>
                    <button
                      class="my-auto hover:animate-pulse"
                      onClick={() => {
                        askUnlinkRecipe('Deseja desvincular a receita?', {
                          showConfirmModal: props.showConfirmModal,
                          group: () => group(),
                          setGroup: props.setGroup,
                        })
                      }}
                    >
                      <BrokenLink />
                    </button>
                  </>
                )}
              </Show>
              <Show when={!props.recipe}>
                <>Receita não encontrada</>
              </Show>
            </>
          )}
        </Show>
      </div>
    </Show>
  )
}

export default GroupHeaderActions
