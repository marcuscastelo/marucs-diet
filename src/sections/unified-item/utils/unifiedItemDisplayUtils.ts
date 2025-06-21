import { type UnifiedItem } from '~/modules/diet/unified-item/schema/unifiedItemSchema'

export type ItemTypeDisplay = {
  icon: string
  color: string
  label: string
}

export function getItemTypeDisplay(item: UnifiedItem): ItemTypeDisplay {
  switch (item.reference.type) {
    case 'food':
      return {
        icon: '🍽️',
        color: 'text-white',
        label: 'alimento',
      }
    case 'recipe':
      return {
        icon: '📖',
        color: 'text-yellow-200',
        label: 'receita',
      }
    case 'group':
      return {
        icon: '📦',
        color: 'text-green-200',
        label: 'grupo',
      }
  }
}

export function createEventHandler<T>(callback?: (item: T) => void, item?: T) {
  if (callback === undefined || item === undefined) {
    return undefined
  }

  return (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    callback(item)
  }
}
