import { type Accessor } from 'solid-js'

import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'

/**
 * Determines if the group can be applied (has a name and no item is being edited).
 * @param group - Accessor for the current ItemGroup
 * @param editSelection - Accessor for the current edit selection
 * @returns True if the group can be applied
 */
export function canApplyGroup(
  group: Accessor<ItemGroup>,
  editSelection: Accessor<unknown>,
) {
  return group().name.length > 0 && editSelection() === null
}
