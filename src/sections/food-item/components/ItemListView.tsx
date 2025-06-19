import { type Accessor, For, mergeProps } from 'solid-js'

import { type Item } from '~/modules/diet/item/domain/item'
import { HeaderWithActions } from '~/sections/common/components/HeaderWithActions'
import {
  ItemName,
  ItemNutritionalInfo,
  ItemView,
  type ItemViewProps,
} from '~/sections/food-item/components/ItemView'

export type ItemListViewProps = {
  items: Accessor<readonly Item[]>
  makeHeaderFn?: (item: Item) => ItemViewProps['header']
} & Omit<ItemViewProps, 'item' | 'header' | 'nutritionalInfo' | 'macroOverflow'>

export function ItemListView(_props: ItemListViewProps) {
  const props = mergeProps({ makeHeaderFn: DefaultHeader }, _props)
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
                nutritionalInfo={() => <ItemNutritionalInfo />}
                {...props}
              />
            </div>
          )
        }}
      </For>
    </>
  )
}

function DefaultHeader(_item: Item): ItemViewProps['header'] {
  return () => <HeaderWithActions name={<ItemName />} />
}
