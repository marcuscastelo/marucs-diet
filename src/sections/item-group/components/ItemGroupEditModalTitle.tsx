import { type Accessor, Resource, type Setter } from 'solid-js'

import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { type Recipe } from '~/modules/diet/recipe/domain/recipe'
import { type ConfirmModalContext } from '~/sections/common/context/ConfirmModalContext'
import { GroupHeaderActions } from '~/sections/item-group/components/GroupHeaderActions'
import { GroupNameEdit } from '~/sections/item-group/components/GroupNameEdit'

/**
 * Title component for ItemGroupEditModal header.
 * @param props - Title props
 * @returns JSX.Element
 */
export function ItemGroupEditModalTitle(props: {
  targetMealName: string
  recipe: Resource<Recipe | null>
  mutateRecipe: (recipe: Recipe | null) => void
  mode?: 'edit' | 'read-only' | 'summary'
  group: Accessor<ItemGroup>
  setGroup: Setter<ItemGroup>
  hasValidPastableOnClipboard: () => boolean
  handlePaste: () => void
  setRecipeEditModalVisible: Setter<boolean>
  showConfirmModal: ConfirmModalContext['show']
}) {
  return (
    <div class="flex flex-col gap-1">
      <div class="flex items-center justify-between gap-2">
        <GroupNameEdit
          group={props.group}
          setGroup={props.setGroup}
          mode={props.mode}
        />
      </div>
    </div>
  )
}

export default ItemGroupEditModalTitle
