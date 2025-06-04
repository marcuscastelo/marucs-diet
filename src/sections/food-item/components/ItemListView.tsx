import { type Item } from '~/modules/diet/item/domain/item'
import {
  ItemView,
  ItemCopyButton,
  ItemName,
  ItemNutritionalInfo,
  type ItemViewProps,
} from '~/sections/food-item/components/ItemView'
import { mergeProps, type Accessor, For } from 'solid-js'
import { handleClipboardError } from '~/shared/error/errorHandler'
import { useClipboard } from '~/sections/common/hooks/useClipboard'
import { HeaderWithActions } from '~/sections/common/components/HeaderWithActions'

export function ItemListView(_props: {
  items: Accessor<readonly Item[]>
  onItemClick: ItemViewProps['onClick']
  makeHeaderFn?: (item: Item) => ItemViewProps['header']
}) {
  const props = mergeProps({ makeHeaderFn: () => <DefaultHeader /> }, _props)
  return (
    <>
      <For each={props.items()}>
        {(_, idx) => {
          const item = () => props.items()[idx()]
          return (
            <div class="mt-2">
              <ItemView
                item={item}
                onClick={props.onItemClick}
                macroOverflow={() => ({ enable: false })}
                header={props.makeHeaderFn(item())}
                nutritionalInfo={<ItemNutritionalInfo />}
              />
            </div>
          )
        }}
      </For>
    </>
  )
}

function DefaultHeader() {
  const clipboard = useClipboard()
  return (
    <HeaderWithActions
      name={<ItemName />}
      primaryActions={
        <ItemCopyButton
          onCopyItem={(item) => {
            clipboard.write(JSON.stringify(item), (error) => {
              handleClipboardError(error, {
                component: 'ItemListView',
                operation: 'copyItem',
                additionalData: { itemId: item.reference },
              })
            })
          }}
        />
      }
    />
  )
}
