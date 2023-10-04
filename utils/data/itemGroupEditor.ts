import { FoodItem } from '@/model/foodItemModel'
import { deepCopy } from '../deepCopy'
import { ItemContainer } from './itemContainer'
import { ItemGroup } from '@/model/itemGroupModel'

export class ItemGroupEditor implements ItemContainer {
  private readonly group: ItemGroup
  constructor(group: ItemGroup) {
    const copy = deepCopy(group)
    if (!copy) {
      throw new Error('Error copying recipe!')
    }
    this.group = copy
  }

  addItem(item: FoodItem) {
    this.group.items.push(item)
    return this
  }

  addItems(items: FoodItem[]) {
    this.group.items.push(...items)
    return this
  }

  clearItems() {
    this.group.items = []
    return this
  }

  finish() {
    const copy = deepCopy(this.group)

    if (!copy) {
      throw new Error('Error copying recipe!')
    }

    // TODO: Replace quantity field with a getter that calculates it
    copy.quantity = copy.items.reduce((acc, item) => acc + item.quantity, 0)
    return copy
  }
}
