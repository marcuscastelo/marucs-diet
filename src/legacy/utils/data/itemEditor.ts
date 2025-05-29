import { type Item } from '~/modules/diet/item/domain/item'
import { Editor } from '~/legacy/utils/data/editor'

export class ItemEditor extends Editor<Item> {
  private readonly item = this.content

  setQuantity(quantity: Item['quantity']) {
    this.item.quantity = quantity
    return this
  }

  protected override onFinish(): void {
    // Do nothing
  }
}
