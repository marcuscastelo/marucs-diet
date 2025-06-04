import { Show } from 'solid-js'
import { toastPromise } from '~/shared/toastPromise'
import { deleteRecentFoodByFoodId } from '~/legacy/controllers/recentFood'
import { handleApiError } from '~/shared/error/errorHandler'
import { TrashIcon } from '~/sections/common/components/icons/TrashIcon'
import { templateSearchTab } from '~/modules/search/application/search'
import { currentUserId } from '~/modules/user/application/user'

type RemoveFromRecentButtonProps = {
  templateId: number
  refetch: () => Promise<void>
}

export function RemoveFromRecentButton(props: RemoveFromRecentButtonProps) {
  const handleClick = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    toastPromise(deleteRecentFoodByFoodId(currentUserId(), props.templateId), {
      loading: 'Removendo alimento da lista de recentes...',
      success: 'Alimento removido da lista de recentes com sucesso!',
      error: (err) => {
        handleApiError(err, {
          component: 'RemoveFromRecentButton',
          operation: 'deleteRecentFood',
          additionalData: { foodId: props.templateId },
        })
        return 'Erro ao remover alimento da lista de recentes.'
      },
    })
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
