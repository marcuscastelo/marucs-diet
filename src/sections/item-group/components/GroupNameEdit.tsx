import { type Accessor, createSignal, type Setter, Show } from 'solid-js'

import type { ItemGroup } from '~/modules/diet/item-group/domain/itemGroup'
import { updateItemGroupName } from '~/modules/diet/item-group/domain/itemGroupOperations'

export function GroupNameEdit(props: {
  group: Accessor<ItemGroup>
  setGroup: Setter<ItemGroup>
  mode?: 'edit' | 'read-only' | 'summary'
}) {
  const [isEditingName, setIsEditingName] = createSignal(false)
  return (
    <Show
      when={isEditingName() && props.mode === 'edit'}
      fallback={
        <div class="flex items-center gap-1 min-w-0">
          <span
            class="truncate text-lg font-semibold text-white"
            title={props.group().name}
          >
            {props.group().name}
          </span>
          {props.mode === 'edit' && (
            <button
              class="btn cursor-pointer uppercase btn-xs btn-ghost px-1"
              aria-label="Editar nome do grupo"
              onClick={() => setIsEditingName(true)}
              style={{ 'line-height': '1' }}
            >
              ✏️
            </button>
          )}
        </div>
      }
    >
      <form
        class="flex items-center gap-1 min-w-0 w-full"
        onSubmit={(e) => {
          e.preventDefault()
          setIsEditingName(false)
        }}
      >
        <input
          class="input input-xs w-full max-w-[180px]"
          type="text"
          value={props.group().name}
          onChange={(e) =>
            props.setGroup(updateItemGroupName(props.group(), e.target.value))
          }
          onBlur={() => setIsEditingName(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setIsEditingName(false)
          }}
          ref={(ref: HTMLInputElement) => {
            setTimeout(() => {
              ref.focus()
              ref.select()
            }, 0)
          }}
          disabled={props.mode !== 'edit'}
          style={{
            'padding-top': '2px',
            'padding-bottom': '2px',
            'font-size': '1rem',
          }}
        />
        <button
          class="btn cursor-pointer uppercase btn-xs btn-primary px-2"
          aria-label="Salvar nome do grupo"
          onClick={() => setIsEditingName(false)}
          type="submit"
          style={{ 'min-width': '48px', height: '28px' }}
        >
          Salvar
        </button>
      </form>
    </Show>
  )
}

export default GroupNameEdit
