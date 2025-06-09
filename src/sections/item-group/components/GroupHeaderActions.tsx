import { type Accessor, Resource, type Setter, Show } from 'solid-js'

import { deepCopy } from '~/legacy/utils/deepCopy'
import { askUnlinkRecipe } from '~/modules/diet/item-group/application/itemGroupModals'
import {
  isRecipedGroupUpToDate,
  isRecipedItemGroup,
  isSimpleItemGroup,
  type ItemGroup,
  type RecipedItemGroup,
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
import { formatError } from '~/shared/formatError'

// Helper for recipe complexity
function isRecipeTooComplex(recipe: Recipe | undefined | null): boolean {
  return (
    recipe !== undefined && recipe !== null && recipe.prepared_multiplier !== 1
  )
}

function PasteButton(props: { disabled: boolean; onPaste: () => void }) {
  return (
    <button
      class="btn-ghost btn cursor-pointer uppercase px-2 text-white hover:scale-105"
      onClick={() => props.onPaste()}
      disabled={props.disabled}
    >
      <PasteIcon />
    </button>
  )
}

function ConvertToRecipeButton(props: { onConvert: () => void }) {
  return (
    <button class="my-auto" onClick={() => props.onConvert()}>
      <ConvertToRecipeIcon />
    </button>
  )
}

function RecipeButton(props: { onClick: () => void }) {
  return (
    <button class="my-auto" onClick={() => props.onClick()}>
      <RecipeIcon />
    </button>
  )
}

function SyncRecipeButton(props: { onClick: () => void }) {
  return (
    <button class="my-auto hover:animate-pulse" onClick={() => props.onClick()}>
      <DownloadIcon />
    </button>
  )
}

function UnlinkRecipeButton(props: { onClick: () => void }) {
  return (
    <button class="my-auto hover:animate-pulse" onClick={() => props.onClick()}>
      <BrokenLink />
    </button>
  )
}

function RecipeActions(props: {
  group: RecipedItemGroup
  recipe: Recipe
  setRecipeEditModalVisible: Setter<boolean>
  onSync: () => void
  onUnlink: () => void
}) {
  const upToDate = () => isRecipedGroupUpToDate(props.group, props.recipe)

  return (
    <>
      <Show
        when={upToDate()}
        fallback={<SyncRecipeButton onClick={props.onSync} />}
      >
        <RecipeButton onClick={() => props.setRecipeEditModalVisible(true)} />
      </Show>
      <UnlinkRecipeButton onClick={props.onUnlink} />
    </>
  )
}

export function GroupHeaderActions(props: {
  group: Accessor<ItemGroup>
  setGroup: Setter<ItemGroup>
  mode?: 'edit' | 'read-only' | 'summary'
  recipe: Resource<Recipe | null>
  mutateRecipe: (recipe: Recipe | null) => void
  hasValidPastableOnClipboard: () => boolean
  handlePaste: () => void
  setRecipeEditModalVisible: Setter<boolean>
  showConfirmModal: ConfirmModalContext['show']
}) {
  function handlePasteClick() {
    if (isRecipeTooComplex(props.recipe())) {
      showError(
        'Os itens desse grupo não podem ser editados. Motivo: a receita é muito complexa, ainda não é possível editar receitas complexas',
      )
      return
    }
    props.handlePaste()
  }

  async function handleConvertToRecipe() {
    const group = props.group()
    try {
      const newRecipe = createNewRecipe({
        name:
          group.name.length > 0
            ? group.name
            : 'Nova receita (a partir de um grupo)',
        items: deepCopy(group.items) ?? [],
        owner: currentUserId(),
      })
      const insertedRecipe = await insertRecipe(newRecipe)
      const newGroup = setItemGroupRecipe(group, insertedRecipe.id)
      props.setGroup(newGroup)
      props.setRecipeEditModalVisible(true)
    } catch (err) {
      showError(`Falha ao criar receita a partir de grupo: ${formatError(err)}`)
    }
  }

  function handleSyncGroupItems(group: ItemGroup, recipe: Recipe) {
    const newGroup = setItemGroupItems(group, recipe.items)
    props.setGroup(newGroup)
  }

  function handleUnlinkRecipe(group: ItemGroup) {
    askUnlinkRecipe('Deseja desvincular a receita?', {
      showConfirmModal: props.showConfirmModal,
      recipe: props.recipe,
      mutateRecipe: props.mutateRecipe,
      group: () => group,
      setGroup: props.setGroup,
    })
  }

  return (
    <Show when={props.mode === 'edit'}>
      <div class="flex gap-2 ml-4">
        <Show when={props.hasValidPastableOnClipboard()}>
          <PasteButton
            disabled={isRecipeTooComplex(props.recipe())}
            onPaste={handlePasteClick}
          />
        </Show>
        <Show when={isSimpleItemGroup(props.group())}>
          <ConvertToRecipeButton
            onConvert={() => void handleConvertToRecipe()}
          />
        </Show>
        <Show
          when={(() => {
            const group_ = props.group()
            return isRecipedItemGroup(group_) && group_
          })()}
        >
          {(group) => (
            <>
              <Show when={props.recipe()}>
                {(recipe) => (
                  <RecipeActions
                    group={group()}
                    recipe={recipe()}
                    setRecipeEditModalVisible={props.setRecipeEditModalVisible}
                    onSync={() => handleSyncGroupItems(group(), recipe())}
                    onUnlink={() => handleUnlinkRecipe(group())}
                  />
                )}
              </Show>
              <Show when={!props.recipe()}>
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
