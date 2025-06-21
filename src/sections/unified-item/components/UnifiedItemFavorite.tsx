import {
  isFoodFavorite,
  setFoodAsFavorite,
} from '~/modules/user/application/user'
import { createDebug } from '~/shared/utils/createDebug'

const debug = createDebug()

export type UnifiedItemFavoriteProps = {
  foodId: number
}

export function UnifiedItemFavorite(props: UnifiedItemFavoriteProps) {
  debug('UnifiedItemFavorite called', { props })

  const toggleFavorite = (e: MouseEvent) => {
    debug('toggleFavorite', {
      foodId: props.foodId,
      isFavorite: isFoodFavorite(props.foodId),
    })
    setFoodAsFavorite(props.foodId, !isFoodFavorite(props.foodId))
    e.stopPropagation()
    e.preventDefault()
  }

  return (
    <div
      class="text-3xl text-orange-400 active:scale-105 hover:text-blue-200"
      onClick={toggleFavorite}
    >
      {isFoodFavorite(props.foodId) ? '★' : '☆'}
    </div>
  )
}
