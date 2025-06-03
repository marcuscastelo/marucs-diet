import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import {
  ItemGroupView,
  ItemGroupCopyButton,
  ItemGroupHeader,
  ItemGroupName,
  ItemGroupViewNutritionalInfo,
  type ItemGroupViewProps,
} from '~/sections/item-group/components/ItemGroupView'
import { useClipboard } from '~/sections/common/hooks/useClipboard'
import { type Accessor } from 'solid-js'
import { handleClipboardError } from '~/shared/error/errorHandler'

export function ItemGroupListView(props: {
  itemGroups: Accessor<ItemGroup[]>
  onItemClick: ItemGroupViewProps['onClick']
}) {
  const clipboard = useClipboard()
  console.debug('[ItemGroupListView] - Rendering')
  return (
    <>
      {props.itemGroups().map((_, idx) => {
        const group = () => props.itemGroups()[idx]
        return (
          <div class="mt-2">
            <ItemGroupView
              itemGroup={group}
              onClick={props.onItemClick}
              header={
                <ItemGroupHeader
                  name={<ItemGroupName group={group} />}
                  copyButton={
                    <ItemGroupCopyButton
                      group={group}
                      onCopyItemGroup={(group) => {
                        clipboard.write(
                          JSON.stringify(group),
                          (err) => {
                            handleClipboardError(err, {
                              component: 'ItemGroupListView',
                              operation: 'copy item group',
                              additionalData: { groupId: group.id },
                            })
                          }
                        )
                      }}
                    />
                  }
                />
              }
              nutritionalInfo={<ItemGroupViewNutritionalInfo group={group} />}
            />
          </div>
        )
      })}
    </>
  )
}
