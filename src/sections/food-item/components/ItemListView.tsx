import { type Accessor, For, mergeProps } from 'solid-js'

import { type Item } from '~/modules/diet/item/domain/item'
import { HeaderWithActions } from '~/sections/common/components/HeaderWithActions'
import { useClipboard } from '~/sections/common/hooks/useClipboard'
import {
  ItemCopyButton,
  ItemName,
  ItemNutritionalInfo,
  ItemView,
  type ItemViewProps,
} from '~/sections/food-item/components/ItemView'
import { handleClipboardError } from '~/shared/error/errorHandler'

export type ItemListViewProps = {
  items: Accessor<readonly Item[]>
  makeHeaderFn?: (item: Item) => ItemViewProps['header']
} & Omit<ItemViewProps, 'item' | 'header' | 'nutritionalInfo' | 'macroOverflow'>

export function ItemListView(_props: ItemListViewProps) {
  const props = mergeProps(
    { makeHeaderFn: () => <DefaultHeader mode={_props.mode} /> },
    _props,
  )
  return (
    <>
      <For each={props.items()}>
        {(item) => {
          return (
            <div class="mt-2">
              <ItemView
                item={() => item}
                macroOverflow={() => ({ enable: false })}
                header={props.makeHeaderFn(item)}
                nutritionalInfo={<ItemNutritionalInfo />}
                {...props}
              />
            </div>
          )
        }}
      </For>
    </>
  )
}

function DefaultHeader(props: { mode?: 'edit' | 'read-only' | 'summary' }) {
  const clipboard = useClipboard()
  return (
    <HeaderWithActions
      name={<ItemName />}
      primaryActions={
        props.mode === 'summary' ? null : (
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
        )
      }
    />
  )
}
