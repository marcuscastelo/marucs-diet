import {
  type Accessor,
  createContext,
  createSignal,
  type JSXElement,
  type Setter,
  untrack,
  useContext,
} from 'solid-js'

import { type ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'

export type ItemGroupEditContext = {
  group: Accessor<ItemGroup>
  persistentGroup: Accessor<ItemGroup>
  setGroup: Setter<ItemGroup>
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
  group: Accessor<ItemGroup>
  setGroup: (group: ItemGroup) => void
  onSaveGroup: (group: ItemGroup) => void
  children: JSXElement
}) {
  // Initialize with untracked read to avoid reactivity warning
  const [persistentGroup, setPersistentGroup] = createSignal<ItemGroup>(
    untrack(() => props.group()),
  )

  // Wrapper to convert props.setGroup to a Setter
  const setGroup: Setter<ItemGroup> = (value) => {
    const newValue =
      typeof value === 'function'
        ? (value as (prev: ItemGroup) => ItemGroup)(props.group())
        : (value as ItemGroup)
    props.setGroup(newValue)
  }

  const handleSaveGroup = () => {
    const group_ = props.group()
    props.onSaveGroup(group_)
    setPersistentGroup(group_)
  }

  return (
    <itemGroupEditContext.Provider
      value={{
        group: props.group,
        persistentGroup,
        setGroup,
        saveGroup: handleSaveGroup,
      }}
    >
      {props.children}
    </itemGroupEditContext.Provider>
  )
}
