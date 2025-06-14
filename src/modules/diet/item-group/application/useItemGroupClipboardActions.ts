import { type Accessor, type Setter } from 'solid-js'
import { z } from 'zod'

import { itemSchema } from '~/modules/diet/item/domain/item'
import {
  isClipboardItem,
  isClipboardItemGroup,
} from '~/modules/diet/item-group/application/clipboardGuards'
import {
  type ItemGroup,
  itemGroupSchema,
} from '~/modules/diet/item-group/domain/itemGroup'
import {
  addItemsToGroup,
  addItemToGroup,
} from '~/modules/diet/item-group/domain/itemGroupOperations'
import { showError } from '~/modules/toast/application/toastManager'
import { useCopyPasteActions } from '~/sections/common/hooks/useCopyPasteActions'
import { regenerateId } from '~/shared/utils/idUtils'

export type ItemOrGroup =
  | z.infer<typeof itemSchema>
  | z.infer<typeof itemGroupSchema>

export function useItemGroupClipboardActions({
  group,
  setGroup,
}: {
  group: Accessor<ItemGroup>
  setGroup: Setter<ItemGroup>
}) {
  const acceptedClipboardSchema = z.union([
    itemSchema,
    itemGroupSchema,
  ]) as z.ZodType<ItemOrGroup>
  const { handlePaste, hasValidPastableOnClipboard } =
    useCopyPasteActions<ItemOrGroup>({
      acceptedClipboardSchema,
      getDataToCopy: () => group() as ItemOrGroup,
      onPaste: (data) => {
        if (isClipboardItemGroup(data)) {
          const validItems = data.items
            .filter(isClipboardItem)
            .map(regenerateId)
          setGroup(addItemsToGroup(group(), validItems))
        } else if (isClipboardItem(data)) {
          setGroup(addItemToGroup(group(), regenerateId(data)))
        } else {
          showError('Clipboard data is not a valid item or group')
        }
      },
    })
  return { handlePaste, hasValidPastableOnClipboard }
}
