import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import {
  createContext,
  type Accessor,
  type Setter,
  useContext,
  createSignal,
  type JSXElement,
} from 'solid-js'
import { createMirrorSignal } from '~/sections/common/hooks/createMirrorSignal'

export type ItemGroupEditContext = {
  group: Accessor<ItemGroup | null>
  persistentGroup: Accessor<ItemGroup | null>
  setGroup: Setter<ItemGroup | null>
  saveGroup: () => void
}

const itemGroupEditContext = createContext<ItemGroupEditContext | null>(null)

export function useItemGroupEditContext() {
  const context = useContext(itemGroupEditContext)

  if (context === null) {
    throw new Error(
      'useItemGroupContext must be used within a ItemGroupContextProvider',
    )
  }

  return context
}

export function ItemGroupEditContextProvider(props: {
  group: Accessor<ItemGroup | null>
  setGroup: (group: ItemGroup | null) => void
  onSaveGroup: (group: ItemGroup) => void
  children: JSXElement
}) {
  const [group, setGroup] = createMirrorSignal<ItemGroup | null>(() =>
    props.group(),
  )

  const [persistentGroup, setPersistentGroup] = createSignal<ItemGroup | null>(
    // eslint-disable-next-line solid/reactivity
    props.group(),
  )

  const handleSaveGroup = () => {
    const group_ = group()
    if (group_ === null) {
      throw new Error('Group is null')
    }
    props.onSaveGroup(group_)
    setPersistentGroup(group_)
  }

  return (
    <itemGroupEditContext.Provider
      value={{ group, persistentGroup, setGroup, saveGroup: handleSaveGroup }}
    >
      {props.children}
    </itemGroupEditContext.Provider>
  )
}
