import { FoodItem } from '@/model/foodItemModel'
import { Editor } from './editor'

export class ItemEditor extends Editor<FoodItem> {
  private readonly item = this.content

  setQuantity(quantity: number) {
    this.item.quantity = quantity
    return this
  }

  // TODO: Move eslint-disable-next-line to eslint config
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected beforeFinish(): void {}
  // TODO: Move eslint-disable-next-line to eslint config
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected afterFinish(): void {}
}
