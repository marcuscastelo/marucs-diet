import { Show } from 'solid-js'

import { deleteRecentFoodByFoodId } from '~/modules/recent-food/application/recentFood'
import { templateSearchTab } from '~/modules/search/application/search'
import { showPromise } from '~/modules/toast/application/toastManager'
import { currentUserId } from '~/modules/user/application/user'
import { TrashIcon } from '~/sections/common/components/icons/TrashIcon'
import { handleApiError } from '~/shared/error/errorHandler'

type RemoveFromRecentButtonProps = {
  templateId: number
  refetch: () => Promise<void>
}

export function RemoveFromRecentButton(props: RemoveFromRecentButtonProps) {
  const handleClick = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    void showPromise(
      deleteRecentFoodByFoodId(currentUserId(), props.templateId),
      {
        loading: 'Removendo alimento da lista de recentes...',
        success: 'Alimento removido da lista de recentes com sucesso!',
        error: (err: unknown) => {
          handleApiError(err, {
            component: 'RemoveFromRecentButton',
            operation: 'deleteRecentFood',
            additionalData: { foodId: props.templateId },
          })
          return 'Erro ao remover alimento da lista de recentes.'
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
