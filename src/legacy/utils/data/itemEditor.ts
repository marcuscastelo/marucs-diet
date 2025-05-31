import { itemSchema, type Item } from '~/modules/diet/item/domain/item'
import { Editor } from '~/legacy/utils/data/editor'
import { deepCopy } from '../deepCopy'

export class ItemEditor extends Editor<Item, Item> {
  private readonly item = this.content

  setQuantity(quantity: Item['quantity']) {
    this.item.quantity = quantity
    return this
  }

  protected override onFinish() { 

  }
}
