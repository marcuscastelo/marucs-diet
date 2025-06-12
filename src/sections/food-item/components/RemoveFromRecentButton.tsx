import { Show } from 'solid-js'

import { deleteRecentFoodByReference } from '~/modules/recent-food/application/recentFood'
import { templateSearchTab } from '~/modules/search/application/search'
import { showPromise } from '~/modules/toast/application/toastManager'
import { currentUserId } from '~/modules/user/application/user'
import { TrashIcon } from '~/sections/common/components/icons/TrashIcon'
import { handleApiError } from '~/shared/error/errorHandler'

type RemoveFromRecentButtonProps = {
  templateId: number
  refetch: (info?: unknown) => unknown
}

export function RemoveFromRecentButton(
  props: RemoveFromRecentButtonProps & { type: 'food' | 'recipe' },
) {
  const handleClick = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    void showPromise(
      deleteRecentFoodByReference(
        currentUserId(),
        props.type,
        props.templateId,
      ),
      {
        loading: 'Removendo item da lista de recentes...',
        success: 'Item removido da lista de recentes com sucesso!',
        error: (err: unknown) => {
          handleApiError(err, {
            component: 'RemoveFromRecentButton',
            operation: 'deleteRecentFood',
            additionalData: { type: props.type, referenceId: props.templateId },
          })
          return 'Erro ao remover item da lista de recentes.'
        },
      },
    )
      .then(props.refetch)
      .catch(() => {})
  }

  return (
    <Show when={templateSearchTab() === 'recent'}>
      <button
        class="my-auto pt-2 pl-1 hover:animate-pulse"
        onClick={handleClick}
        aria-label="Remover dos recentes"
        type="button"
      >
        <TrashIcon size={20} />
      </button>
    </Show>
  )
}
