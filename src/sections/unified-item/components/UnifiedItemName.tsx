import { type Accessor, createMemo, createResource, Show } from 'solid-js'

import { fetchRecipeById } from '~/modules/diet/recipe/application/recipe'
import {
  isRecipeItem,
  type UnifiedItem,
} from '~/modules/diet/unified-item/schema/unifiedItemSchema'
import { getItemTypeDisplay } from '~/sections/unified-item/utils/unifiedItemDisplayUtils'

export type UnifiedItemNameProps = {
  item: Accessor<UnifiedItem>
}

export function UnifiedItemName(props: UnifiedItemNameProps) {
  const typeDisplay = () => getItemTypeDisplay(props.item())

  const [originalRecipe] = createResource(
    () => {
      const item = props.item()
      return isRecipeItem(item) ? item.reference.id : null
    },
    async (recipeId: number) => {
      try {
        return await fetchRecipeById(recipeId)
      } catch (error) {
        console.warn('Failed to fetch recipe for comparison:', error)
        return null
      }
    },
  )

  const isManuallyEdited = createMemo(() => {
    const item = props.item()
    const unifiedRecipe = originalRecipe()

    if (
      !isRecipeItem(item) ||
      unifiedRecipe === null ||
      unifiedRecipe === undefined ||
      originalRecipe.loading
    ) {
      return false
    }

    // TODO: implement recipe item manual edit detection
    return false
  })

  const warningIndicator = () => (isManuallyEdited() ? '⚠️' : '')

  return (
    <h5 class={`mb-2 text-lg font-bold tracking-tight ${typeDisplay().color}`}>
      <span class="mr-2 cursor-help" title={typeDisplay().label}>
        {typeDisplay().icon}
      </span>
      {props.item().name}
      <Show when={warningIndicator()}>
        <span class="ml-1 text-yellow-500" title="Receita editada pontualmente">
          {warningIndicator()}
        </span>
      </Show>
    </h5>
  )
}
