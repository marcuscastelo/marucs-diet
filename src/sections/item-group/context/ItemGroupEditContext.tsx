import { type ItemGroup } from '@/modules/diet/item-group/domain/itemGroup'
import { createContext, type Accessor, type Setter, useContext, createSignal, type JSXElement } from 'solid-js'

export type ItemGroupEditContext = {
  group: Accessor<ItemGroup | null>
  setGroup: Setter<ItemGroup | null>
  saveGroup: () => void
}

const itemGroupEditContext = createContext<ItemGroupEditContext | null>(null)

export function useItemGroupEditContext () {
  const context = useContext(itemGroupEditContext)

  if (context === null) {
    throw new Error(
      'useItemGroupContext must be used within a ItemGroupContextProvider'
    )
  }

  return context
}

export function ItemGroupEditContextProvider (props: {
  group: Accessor<ItemGroup | null>
  setGroup: (group: ItemGroup | null) => void
  onSaveGroup: (group: ItemGroup) => void
  children: JSXElement
}) {
  const [group, setGroup] = createSignal<ItemGroup | null>(props.group())

  createContext(() => {
    console.debug(
      '[ItemGroupEditContextProvider] <signalEffect> - initialGroup changed to ',
      props.group()
    )
    setGroup(props.group())
  })

  const handleSaveGroup = () => {
    const group_ = group()
    if (group_ === null) {
      throw new Error('Group is null')
    }
    props.onSaveGroup(group_)
  }

  return (
    <itemGroupEditContext.Provider
      value={{ group, setGroup, saveGroup: handleSaveGroup }}
    >
      {props.children}
    </itemGroupEditContext.Provider>
  )
}
