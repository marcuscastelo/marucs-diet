import {
  createContext,
  createSignal,
  JSX,
  onCleanup,
  Show,
  useContext,
} from 'solid-js'

import { cn } from '~/shared/cn'

const ContextMenuContext = createContext<{
  open: () => boolean
  setOpen: (v: boolean) => void
}>()

export function ContextMenu(props: {
  trigger: JSX.Element
  children: JSX.Element | JSX.Element[]
  class?: string
}) {
  const [open, setOpen] = createSignal(false)

  function handleDocumentClick(e: MouseEvent) {
    if (!(e.target as HTMLElement)?.closest('.context-menu-root')) {
      setOpen(false)
    }
  }

  function handleTriggerClick(e: MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    setOpen((v) => !v)
  }

  onCleanup(() => {
    document.removeEventListener('click', handleDocumentClick)
  })

  return (
    <ContextMenuContext.Provider value={{ open, setOpen }}>
      <div
        class={cn('relative my-auto context-menu-root outline', props.class)}
      >
        <div class="my-auto" onClick={handleTriggerClick}>
          {props.trigger}
        </div>
        <Show when={open()}>
          <div
            class="absolute right-0 z-50 mt-2 min-w-[120px] rounded bg-gray-800 shadow-lg border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {props.children}
          </div>
        </Show>
      </div>
    </ContextMenuContext.Provider>
  )
}

// Add ContextMenu.Item subcomponent
ContextMenu.Item = function Item(props: {
  children: JSX.Element
  class?: string
  onClick: (e: MouseEvent) => void
}) {
  const ctx = useContext(ContextMenuContext)
  const handleClick = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    props.onClick(e)
    ctx?.setOpen(false)
  }

  return (
    <button
      class={cn(
        'context-menu-item min-w-[120px] active:scale-105',
        props.class,
      )}
      onClick={handleClick}
    >
      {props.children}
    </button>
  )
}
