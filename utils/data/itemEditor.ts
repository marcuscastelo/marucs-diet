import { FoodItem } from '@/model/foodItemModel'
import { Editor } from './editor'

export class ItemEditor extends Editor<FoodItem> {
  private readonly item = this.content

  setQuantity(quantity: number) {
    this.item.quantity = quantity
    return this
  }

  protected override onFinish(): void {
    // Do nothing
  }
}
