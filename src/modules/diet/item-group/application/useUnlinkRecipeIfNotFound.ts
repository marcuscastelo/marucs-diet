import { createEffect } from 'solid-js'
import { Accessor, type Setter } from 'solid-js'

import { askUnlinkRecipe } from '~/modules/diet/item-group/application/itemGroupModals'
import {
  isRecipedItemGroup,
  ItemGroup,
} from '~/modules/diet/item-group/domain/itemGroup'
import { type ConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'

/**
 * Effect to ask for unlinking a recipe if the group has a recipe that is not found.
 * @param group Accessor for the current ItemGroup
 * @param recipeSignal Resource signal for the recipe
 * @param showConfirmModal Show confirm modal function
 * @param setGroup Setter for the group
 */
export function useUnlinkRecipeIfNotFound({
  group,
  recipeSignal,
  showConfirmModal,
  setGroup,
}: {
  group: Accessor<ItemGroup>
  recipeSignal: { state: string; (): unknown }
  showConfirmModal: ConfirmModalContext['show']
  setGroup: Setter<ItemGroup>
}) {
  createEffect(() => {
    const group_ = group()
    const groupHasRecipe = isRecipedItemGroup(group_)
    if (groupHasRecipe) {
      setTimeout(() => {
        if (recipeSignal.state === 'ready' && recipeSignal() === null) {
          setTimeout(() => {
            askUnlinkRecipe(
              'A receita atrelada a esse grupo não foi encontrada. Deseja desvincular o grupo da receita?',
              {
                showConfirmModal,
                group,
                setGroup,
              },
            )
          }, 0)
        }
      }, 200)
    }
  })
}
