import { type Accessor, Resource, type Setter } from 'solid-js'

import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { setItemGroupRecipe } from '~/modules/diet/item-group/domain/itemGroupOperations'
import { Recipe } from '~/modules/diet/recipe/domain/recipe'
import { type ConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'

/**
 * Unlinks a recipe from an item group by setting its recipe to undefined.
 * @param signals - Contains group accessor and setter
 */
export function unlinkRecipe(signals: {
  group: Accessor<ItemGroup>
  setGroup: Setter<ItemGroup>
  recipe: Resource<Recipe | null>
  mutateRecipe: (recipe: Recipe | null) => void
}): void {
  signals.setGroup(setItemGroupRecipe(signals.group(), undefined))
  signals.mutateRecipe(null)
}

/**
 * Shows a confirmation modal to unlink a recipe from a group.
 * @param prompt - The confirmation message
 * @param signals - Modal context and group accessors
 */
export function askUnlinkRecipe(
  prompt: string,
  signals: {
    showConfirmModal: ConfirmModalContext['show']
    group: Accessor<ItemGroup>
    setGroup: Setter<ItemGroup>
    recipe: Resource<Recipe | null>
    mutateRecipe: (recipe: Recipe | null) => void
  },
): void {
  signals.showConfirmModal({
    title: 'Desvincular receita',
    body: prompt,
    actions: [
      {
        text: 'Cancelar',
        onClick: () => undefined,
      },
      {
        text: 'Desvincular',
        primary: true,
        onClick: () => {
          unlinkRecipe(signals)
        },
      },
    ],
  })
}
