import { type Item } from '~/modules/diet/item/domain/item'
import { Editor } from '~/legacy/utils/data/editor'

// TODO:   Remove deprecated ItemEditor - Replace with pure functions in item/application/
/**
 * @deprecated Use pure functions instead of ItemEditor pattern.
 * Replace with functions like: updateItemQuantity(item, quantity)
 * See CODESTYLE_GUIDE.md section #3 for replacement patterns.
 */
export class ItemEditor extends Editor<Item, Item> {
  private readonly item = this.content

  setQuantity(quantity: Item['quantity']) {
    this.item.quantity = quantity
    return this
  }

  protected override onFinish() {}
}
